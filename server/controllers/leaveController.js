// Leave controller
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

const { notify, notifyRole } = require("../utils/notify");

const todayStr = () => new Date().toLocaleDateString("en-CA");
const populateLeave = (q) => q.populate("employee", "name email role").populate("reviewedBy", "name");

// employee / manager: apply
exports.applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        if (!leaveType || !startDate || !endDate || !reason)
            return res.status(400).json({ message: "All fields are required" });
        if (startDate < todayStr())
            return res.status(400).json({ message: "Start date cannot be in the past" });
        if (endDate < startDate)
            return res.status(400).json({ message: "End date cannot be before start date" });

        const s = new Date(startDate);
        const e = new Date(endDate);

        const overlap = await Leave.findOne({
            employee: req.user._id,
            status: { $in: ["pending", "approved"] },
            startDate: { $lte: e },
            endDate: { $gte: s },
        });
        if (overlap)
            return res.status(400).json({ message: "You already have a leave request for these dates" });

        const leave = await Leave.create({
            employee: req.user._id, leaveType, startDate: s, endDate: e, reason,
        });


        const emp = await Employee.findOne({ user: req.user._id });
        const msg = `${req.user.name} applied for ${leaveType} leave (${startDate} to ${endDate})`;
        if (emp?.manager) await notify(emp.manager, msg);
        else await notifyRole("hr", msg);


        res.status(201).json(await populateLeave(Leave.findById(leave._id)));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// own leaves
exports.getMyLeaves = async (req, res) => {
    try {
        res.json(await populateLeave(Leave.find({ employee: req.user._id }).sort({ createdAt: -1 })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// manager: team's leaves, HR: everyone's
exports.getLeaves = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === "manager") {
            const team = await Employee.find({ manager: req.user._id }).select("user");
            filter.employee = { $in: team.map((t) => t.user) };
        }
        if (["pending", "approved", "rejected"].includes(req.query.status))
            filter.status = req.query.status;

        res.json(await populateLeave(Leave.find(filter).sort({ createdAt: -1 }).limit(100)));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// manager / HR: approve or reject
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, comment } = req.body;
        if (!["approved", "rejected"].includes(status))
            return res.status(400).json({ message: "Status must be approved or rejected" });

        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: "Leave request not found" });
        if (leave.status !== "pending")
            return res.status(400).json({ message: "This request was already reviewed" });
        if (leave.employee.toString() === req.user._id.toString())
            return res.status(403).json({ message: "You cannot review your own leave" });

        if (req.user.role === "manager") {
            const isTeamMember = await Employee.findOne({ user: leave.employee, manager: req.user._id });
            if (!isTeamMember)
                return res.status(403).json({ message: "This employee is not in your team" });
        }

        leave.status = status;
        leave.reviewedBy = req.user._id;
        leave.reviewComment = comment || "";
        await leave.save();

        await notify(
            leave.employee,
            `Your ${leave.leaveType} leave (${leave.startDate.toISOString().slice(0, 10)} to ${leave.endDate.toISOString().slice(0, 10)}) was ${status} by ${req.user.name}`
        );

        res.json(await populateLeave(Leave.findById(leave._id)));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// owner: cancel a pending request
exports.cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findOne({ _id: req.params.id, employee: req.user._id });
        if (!leave) return res.status(404).json({ message: "Leave request not found" });
        if (leave.status !== "pending")
            return res.status(400).json({ message: "Only pending requests can be cancelled" });
        await leave.deleteOne();
        res.json({ message: "Leave request cancelled" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};