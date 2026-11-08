const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, default: "" },
  message: { type: String, maxlength: 300, default: "" },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Invitation", invitationSchema);