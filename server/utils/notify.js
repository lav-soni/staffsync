const Notification = require("../models/Notification");
const User = require("../models/User");

exports.notify = async (userId, message) => {
  try {
    await Notification.create({ user: userId, message });
  } catch (err) {
    console.error("Notification failed:", err.message);
  }
};

exports.notifyRole = async (role, message) => {
  try {
    const users = await User.find({ role }).select("_id");
    await Notification.insertMany(users.map((u) => ({ user: u._id, message })));
  } catch (err) {
    console.error("Notification failed:", err.message);
  }
};

exports.notifyAll = async (message, excludeId) => {
  try {
    const users = await User.find(excludeId ? { _id: { $ne: excludeId } } : {}).select("_id");
    await Notification.insertMany(users.map((u) => ({ user: u._id, message })));
  } catch (err) {
    console.error("Notification failed:", err.message);
  }
};