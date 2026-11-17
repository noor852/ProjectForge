const mongoose = require("mongoose");

// request = prospective member joining, invite = owner invites
const requestSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["request", "invite"], required: true },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);