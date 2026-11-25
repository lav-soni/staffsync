// Training controller
const Training = require("../models/Training");
const Employee = require("../models/Employee");
const { notify } = require("../utils/notify");

const populateT = (q) => q.populate("createdBy", "name").populate("participants.user", "name email");

// returns the ids only if every one belongs to this manager's team
const validTeam = async (managerId, ids) => {
  const unique = [...new Set(ids.map(String))];
  const count = await Employee.countDocuments({ manager: managerId, user: { $in: unique } });
  return count === unique.length ? unique : null;
};

// owners and HR see all participants; others only see themselves
const shape = (t, user) => {
  const obj = t.toObject();
  const seesAll = user.role === "hr" || String(obj.createdBy._id) === String(user._id);
  if (!seesAll) obj.participants = obj.participants.filter((p) => String(p.user._id) === String(user._id));
  return obj;
};

// manager: create
exports.createTraining = async (req, res) => {
  try {
    const { title, description, startDate, endDate, assignedTo = [] } = req.body;
    if (!title || !startDate || !endDate)
      return res.status(400).json({ message: "Title, start date and end date are required" });
    if (endDate < startDate)
      return res.status(400).json({ message: "End date cannot be before start date" });

    const ids = await validTeam(req.user._id, assignedTo);
    if (!ids) return res.status(400).json({ message: "You can only assign your own team members" });

    const training = await Training.create({
      title, description, startDate, endDate,
      createdBy: req.user._id,
      participants: ids.map((user) => ({ user })),
    });
    await Promise.all(ids.map((u) => notify(u, `You were assigned to training: ${title}`)));

    res.status(201).json(shape(await populateT(Training.findById(training._id)), req.user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// manager: own programs, employee: assigned ones, HR: all
exports.getTrainings = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "manager") filter.createdBy = req.user._id;
    else if (req.user.role === "employee") filter["participants.user"] = req.user._id;

    const list = await populateT(Training.find(filter).sort({ createdAt: -1 }).limit(100));
    res.json(list.map((t) => shape(t, req.user)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// manager (owner): edit details and assignments
exports.updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });
    if (String(training.createdBy) !== String(req.user._id))
      return res.status(403).json({ message: "You can only edit your own programs" });

    const { title, description, startDate, endDate, assignedTo } = req.body;
    if (startDate && endDate && endDate < startDate)
      return res.status(400).json({ message: "End date cannot be before start date" });

    if (title) training.title = title;
    if (description !== undefined) training.description = description;
    if (startDate) training.startDate = startDate;
    if (endDate) training.endDate = endDate;

    let added = [];
    if (assignedTo) {
      const ids = await validTeam(req.user._id, assignedTo);
      if (!ids) return res.status(400).json({ message: "You can only assign your own team members" });

      const old = new Map(training.participants.map((p) => [String(p.user), p.status]));
      added = ids.filter((u) => !old.has(u));
      training.participants = ids.map((u) => ({ user: u, status: old.get(u) || "assigned" }));
    }

    await training.save();
    await Promise.all(added.map((u) => notify(u, `You were assigned to training: ${training.title}`)));

    res.json(shape(await populateT(Training.findById(training._id)), req.user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// participant: update own progress
exports.updateMyProgress = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["assigned", "in-progress", "completed"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const training = await Training.findOneAndUpdate(
      { _id: req.params.id, "participants.user": req.user._id },
      { $set: { "participants.$.status": status } },
      { new: true }
    );
    if (!training) return res.status(404).json({ message: "You are not assigned to this training" });

    await notify(training.createdBy, `${req.user.name} marked "${training.title}" as ${status}`);
    res.json({ message: "Progress updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// manager (owner) or HR
exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });
    if (req.user.role !== "hr" && String(training.createdBy) !== String(req.user._id))
      return res.status(403).json({ message: "You can only delete your own programs" });

    await training.deleteOne();
    res.json({ message: "Training deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};