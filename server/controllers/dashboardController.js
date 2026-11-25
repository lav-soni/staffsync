const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Training = require("../models/Training");
const Announcement = require("../models/Announcement");
const User = require("../models/User");

const todayStr = () => new Date().toLocaleDateString("en-CA");

exports.getDashboard = async (req, res) => {
  try {
    const me = req.user;
    const today = todayStr();
    const month = today.slice(0, 7);
    const d = new Date(today); // midnight, matches how leave dates are stored

    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("postedBy", "name role");
    const myToday = await Attendance.findOne({ user: me._id, date: today });
    const base = { role: me.role, announcements, myToday };

    // ---------- EMPLOYEE ----------
    if (me.role === "employee") {
      const [daysPresent, pending, approved, rejected, trainings] = await Promise.all([
        Attendance.countDocuments({ user: me._id, date: { $regex: `^${month}` } }),
        Leave.countDocuments({ employee: me._id, status: "pending" }),
        Leave.countDocuments({ employee: me._id, status: "approved" }),
        Leave.countDocuments({ employee: me._id, status: "rejected" }),
        Training.find({ "participants.user": me._id }),
      ]);

      const tCount = { assigned: 0, "in-progress": 0, completed: 0 };
      trainings.forEach((t) => {
        const p = t.participants.find((x) => String(x.user) === String(me._id));
        if (p) tCount[p.status]++;
      });

      return res.json({ ...base, daysPresent, leaves: { pending, approved, rejected }, trainings: tCount });
    }

    // ---------- MANAGER ----------
    if (me.role === "manager") {
      const team = await Employee.find({ manager: me._id }).select("user");
      const ids = team.map((t) => t.user);

      const [presentToday, pendingLeaves, onLeaveToday, programs] = await Promise.all([
        Attendance.countDocuments({ date: today, user: { $in: ids } }),
        Leave.countDocuments({ status: "pending", employee: { $in: ids } }),
        Leave.countDocuments({
          status: "approved", employee: { $in: ids },
          startDate: { $lte: d }, endDate: { $gte: d },
        }),
        Training.find({ createdBy: me._id }),
      ]);

      const tCount = { assigned: 0, "in-progress": 0, completed: 0 };
      programs.forEach((t) => t.participants.forEach((p) => tCount[p.status]++));

      return res.json({
        ...base,
        teamSize: ids.length,
        presentToday,
        notCheckedIn: ids.length - presentToday,
        onLeaveToday,
        pendingLeaves,
        programCount: programs.length,
        trainees: tCount,
      });
    }

    // ---------- HR ----------
    const employees = await Employee.find().select("user");
    const ids = employees.map((e) => e.user);

    const [presentToday, pendingLeaves, onLeaveToday, trainingCount, announcementCount, departments, roles] =
      await Promise.all([
        Attendance.countDocuments({ date: today, user: { $in: ids } }),
        Leave.countDocuments({ status: "pending" }),
        Leave.countDocuments({ status: "approved", startDate: { $lte: d }, endDate: { $gte: d } }),
        Training.countDocuments(),
        Announcement.countDocuments(),
        Employee.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
        User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      ]);

    res.json({
      ...base,
      totalEmployees: ids.length,
      presentToday,
      notCheckedIn: ids.length - presentToday,
      onLeaveToday,
      pendingLeaves,
      trainingCount,
      announcementCount,
      departments,
      roles,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};