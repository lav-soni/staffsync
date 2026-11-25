// Announcement controller
const Announcement = require("../models/Announcement");
const { notifyAll } = require("../utils/notify");

const populateAnn = (q) => q.populate("postedBy", "name role");

// HR / Manager: post
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body)
      return res.status(400).json({ message: "Title and message are required" });

    const ann = await Announcement.create({ title, body, postedBy: req.user._id });
    await notifyAll(`New announcement from ${req.user.name}: ${title}`, req.user._id);
    res.status(201).json(await populateAnn(Announcement.findById(ann._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// everyone: read (paginated)
exports.getAnnouncements = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const total = await Announcement.countDocuments();
    const announcements = await populateAnn(
      Announcement.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    );
    res.json({ announcements, page, pages: Math.ceil(total / limit) || 1, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// HR: any announcement, Manager: only their own
exports.deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Announcement not found" });

    const isOwner = ann.postedBy.toString() === req.user._id.toString();
    if (req.user.role !== "hr" && !isOwner)
      return res.status(403).json({ message: "You can only delete your own announcements" });

    await ann.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};