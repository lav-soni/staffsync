require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Employee = require("./models/Employee");

const demo = [
  { name: "Test HR", email: "hr@test.com", password: "123456", role: "hr", department: "Human Resources", designation: "HR Manager" },
  { name: "Test Manager", email: "manager@test.com", password: "123456", role: "manager", department: "Engineering", designation: "Team Lead" },
  { name: "Riya Sharma", email: "employee@test.com", password: "123456", role: "employee", department: "Engineering", designation: "Developer" },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to:", mongoose.connection.host, "| database:", mongoose.connection.name);

    let managerId;
    for (const d of demo) {
      let user = await User.findOne({ email: d.email });
      if (!user) user = await User.create({ name: d.name, email: d.email, password: d.password, role: d.role });
      if (d.role === "manager") managerId = user._id;
      if (!(await Employee.findOne({ user: user._id })))
        await Employee.create({
          user: user._id, department: d.department, designation: d.designation,
          manager: d.role === "employee" ? managerId : undefined,
        });
    }
    console.log("Demo accounts ready");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();