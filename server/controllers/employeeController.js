// Employee controller
const User = require("../models/User");
const Employee = require("../models/Employee");

const populateEmp = (q) => q.populate("user", "name email role").populate("manager", "name email");

// HR: create user account + employee record
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, manager, phone, address } = req.body;
    if (!name || !email || !password || !department)
      return res.status(400).json({ message: "Name, email, password and department are required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role: role || "employee" });
    try {
      const employee = await Employee.create({
        user: user._id, department, designation, manager: manager || undefined, phone, address,
      });
      res.status(201).json(await populateEmp(Employee.findById(employee._id)));
    } catch (err) {
      await User.findByIdAndDelete(user._id); // undo user if employee creation fails
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// HR: list all (with pagination and optional department filter)
exports.getEmployees = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const filter = req.query.department ? { department: req.query.department } : {};

    const total = await Employee.countDocuments(filter);
    const employees = await populateEmp(
      Employee.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    );
    res.json({ employees, page, pages: Math.ceil(total / limit), total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// HR: get one
exports.getEmployee = async (req, res) => {
  try {
    const employee = await populateEmp(Employee.findById(req.params.id));
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// HR: update
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const { name, role, department, designation, manager, phone, address } = req.body;
    if (name || role) {
      await User.findByIdAndUpdate(employee.user, {
        ...(name && { name }),
        ...(role && { role }),
      });
    }
    Object.assign(employee, {
      ...(department && { department }),
      ...(designation !== undefined && { designation }),
      ...(manager !== undefined && { manager: manager || undefined }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
    });
    await employee.save();
    res.json(await populateEmp(Employee.findById(employee._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// HR: delete employee and their login account
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    await User.findByIdAndDelete(employee.user);
    await employee.deleteOne();
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Any logged-in user: own profile
exports.getMyProfile = async (req, res) => {
  try {
    const employee = await populateEmp(Employee.findOne({ user: req.user._id }));
    if (!employee) return res.status(404).json({ message: "Profile not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Any logged-in user: update only phone and address
exports.updateMyProfile = async (req, res) => {
  try {
    const { phone, address } = req.body;
    const employee = await Employee.findOneAndUpdate(
      { user: req.user._id },
      { ...(phone !== undefined && { phone }), ...(address !== undefined && { address }) },
      { new: true }
    );
    if (!employee) return res.status(404).json({ message: "Profile not found" });
    res.json(await populateEmp(Employee.findById(employee._id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Manager: own team
exports.getTeam = async (req, res) => {
  try {
    res.json(await populateEmp(Employee.find({ manager: req.user._id })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// HR: list manager accounts (for the dropdown)
exports.getManagers = async (req, res) => {
  try {
    res.json(await User.find({ role: "manager" }).select("name email"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};