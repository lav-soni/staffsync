// Employee model
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // a user with role "manager"
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    joiningDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

employeeSchema.index({ department: 1 }); // faster department filtering

module.exports = mongoose.model("Employee", employeeSchema);