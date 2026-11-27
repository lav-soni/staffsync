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
    const profiles = await Employee.find()
      .populate("user", "name email role")
      .sort({ createdAt: 1 });
    const linkedIds = profiles.map((p) => p.user?._id).filter(Boolean);
    // Managers created as accounts only still belong in the workforce overview.
    const orphanManagers = await User.find({ role: "manager", _id: { $nin: linkedIds } }).select("name email role");
    const ids = [...linkedIds, ...orphanManagers.map((u) => u._id)];

    const roleRank = { manager: 0, hr: 1, employee: 2 };
    const workforce = [
      ...profiles.map((p) => ({
        _id: p._id,
        name: p.user?.name || "Team member",
        email: p.user?.email || "",
        role: p.user?.role || "employee",
        department: p.department || "",
        designation: p.designation || "",
      })),
      ...orphanManagers.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: "",
        designation: "",
      })),
    ].sort(
      (a, b) =>
        (roleRank[a.role] ?? 3) - (roleRank[b.role] ?? 3) || a.name.localeCompare(b.name)
    );

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
      notCheckedIn: Math.max(ids.length - presentToday, 0),
      onLeaveToday,
      pendingLeaves,
      trainingCount,
      announcementCount,
      departments,
      roles,
      workforce,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const weekdays = (year, month, lastDay) => {
  let count = 0;
  for (let d = 1; d <= lastDay; d++) {
    const day = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
};

exports.getReport = async (req, res) => {
  try {
    const today = todayStr();
    const month = req.query.month || today.slice(0, 7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
      return res.status(400).json({ message: "Month must look like 2026-11" });

    const [year, mon] = month.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate();
    const monthStart = new Date(Date.UTC(year, mon - 1, 1));
    const monthEnd = new Date(Date.UTC(year, mon - 1, daysInMonth));

    // working days so far: full month if past, up to today if current, none if future
    let lastDay = daysInMonth;
    if (month === today.slice(0, 7)) lastDay = Number(today.slice(8, 10));
    else if (month > today.slice(0, 7)) lastDay = 0;
    const workingDays = weekdays(year, mon, lastDay);

    // HR: everyone, Manager: own team
    const filter = req.user.role === "manager" ? { manager: req.user._id } : {};
    const employees = await Employee.find(filter).populate("user", "name email");
    const ids = employees.map((e) => e.user._id);

    const [attendance, leaves, trainings, pendingLeaves] = await Promise.all([
      Attendance.aggregate([
        { $match: { user: { $in: ids }, date: { $regex: `^${month}` } } },
        { $group: { _id: "$user", days: { $sum: 1 } } },
      ]),
      Leave.find({
        employee: { $in: ids }, status: "approved",
        startDate: { $lte: monthEnd }, endDate: { $gte: monthStart },
      }).lean(),
      Training.find({ "participants.user": { $in: ids } }).lean(),
      Leave.countDocuments({ employee: { $in: ids }, status: "pending" }),
    ]);

    const present = Object.fromEntries(attendance.map((a) => [String(a._id), a.days]));

    const leaveDays = {};
    leaves.forEach((l) => {
      const from = Math.max(new Date(l.startDate), monthStart);
      const to = Math.min(new Date(l.endDate), monthEnd);
      leaveDays[String(l.employee)] = (leaveDays[String(l.employee)] || 0) + Math.round((to - from) / 86400000) + 1;
    });

    const tr = {};
    trainings.forEach((t) =>
      t.participants.forEach((p) => {
        const key = String(p.user);
        if (!ids.some((id) => String(id) === key)) return;
        tr[key] = tr[key] || { assigned: 0, completed: 0 };
        tr[key].assigned++;
        if (p.status === "completed") tr[key].completed++;
      })
    );

    const rows = employees
      .map((e) => {
        const key = String(e.user._id);
        const daysPresent = present[key] || 0;
        return {
          name: e.user.name,
          email: e.user.email,
          department: e.department,
          daysPresent,
          attendancePct: workingDays ? Math.min(100, Math.round((daysPresent / workingDays) * 100)) : 0,
          leaveDays: leaveDays[key] || 0,
          trainingsAssigned: tr[key]?.assigned || 0,
          trainingsCompleted: tr[key]?.completed || 0,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const sum = (k) => rows.reduce((s, r) => s + r[k], 0);
    res.json({
      month,
      workingDays,
      summary: {
        employees: rows.length,
        avgAttendance: rows.length ? Math.round(sum("attendancePct") / rows.length) : 0,
        totalLeaveDays: sum("leaveDays"),
        pendingLeaves,
        trainingCompletion: sum("trainingsAssigned")
          ? Math.round((sum("trainingsCompleted") / sum("trainingsAssigned")) * 100)
          : 0,
      },
      rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};