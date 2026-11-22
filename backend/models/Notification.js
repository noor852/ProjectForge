const mongoose = require("mongoose");

// one notification = one message for one user (shown under the bell icon)
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },   // who receives it
  type: { type: String, enum: ["invite", "request", "accepted", "declined"], required: true },
  message: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  request: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);