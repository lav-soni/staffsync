// Training model
const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["assigned", "in-progress", "completed"], default: "assigned" },
  },
  { _id: false }
);

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [participantSchema],
  },
  { timestamps: true }
);

trainingSchema.index({ createdBy: 1 });
trainingSchema.index({ "participants.user": 1 });

module.exports = mongoose.model("Training", trainingSchema);