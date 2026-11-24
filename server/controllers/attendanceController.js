// Attendance controller
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const todayStr = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

exports.checkIn = async (req, res) => {
  try {
    const date = todayStr();
    if (await Attendance.findOne({ user: req.user._id, date }))
      return res.status(400).json({ message: "Already checked in today" });

    const record = await Attendance.create({ user: req.user._id, date, checkIn: new Date() });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const record = await Attendance.findOne({ user: req.user._id, date: todayStr() });
    if (!record) return res.status(400).json({ message: "Check in first" });
    if (record.checkOut) return res.status(400).json({ message: "Already checked out today" });

    record.checkOut = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user._id }).sort({ date: -1 }).limit(31);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// shared by manager (own team) and HR (everyone): shows present AND absent
const daily = async (req, res, filter) => {
  try {
    const date = req.query.date || todayStr();
    const employees = await Employee.find(filter).populate("user", "name email");
    const records = await Attendance.find({
      date,
      user: { $in: employees.map((e) => e.user._id) },
    });
    const byUser = Object.fromEntries(records.map((r) => [r.user.toString(), r]));

    res.json({
      date,
      team: employees.map((e) => ({
        _id: e.user._id,
        name: e.user.name,
        email: e.user.email,
        department: e.department,
        record: byUser[e.user._id.toString()] || null,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeamAttendance = (req, res) => daily(req, res, { manager: req.user._id });
exports.getAllAttendance = (req, res) => daily(req, res, {});

// HR: days present per employee for a month
exports.getReport = async (req, res) => {
  try {
    const month = req.query.month || todayStr().slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month))
      return res.status(400).json({ message: "Month must look like 2026-11" });

    const data = await Attendance.aggregate([
      { $match: { date: { $regex: `^${month}` } } },
      { $group: { _id: "$user", daysPresent: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { _id: 0, name: "$user.name", email: "$user.email", daysPresent: 1 } },
      { $sort: { name: 1 } },
    ]);
    res.json({ month, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};