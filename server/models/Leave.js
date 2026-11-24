// Leave model
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    leaveType: { type: String, enum: ["sick", "casual", "annual", "other"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewComment: { type: String, trim: true },
  },
  { timestamps: true }
);

leaveSchema.index({ employee: 1, status: 1 });

module.exports = mongoose.model("Leave", leaveSchema);