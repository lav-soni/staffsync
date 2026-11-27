require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Employee = require("./models/Employee");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to:", mongoose.connection.host, "| database:", mongoose.connection.name);

    const users = await User.find().select("_id email role");
    let created = 0;

    for (const u of users) {
      if (await Employee.findOne({ user: u._id })) continue; // already has a profile
      await Employee.create({
        user: u._id,
        department: "Unassigned",
        designation: u.role === "hr" ? "HR" : u.role === "manager" ? "Manager" : "",
      });
      created++;
      console.log("Created profile for", u.email);
    }
    console.log(`Done. ${created} profile(s) created.`);
  } catch (err) {
    console.error("Backfill failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();