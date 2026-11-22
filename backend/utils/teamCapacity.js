
const Request = require("../models/Request");

const INVITE_HOURS = 24;

async function expireInvitations(projectId) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - INVITE_HOURS * 60 * 60 * 1000);

  const filter = {
    type: "invite",
    status: "pending",
    $or: [
      { expiresAt: { $lte: now } },
      {
        expiresAt: null,
        createdAt: { $lte: cutoff }
      }
    ]
  };

  if (projectId) {
    filter.project = projectId;
  }

  await Request.updateMany(filter, {
    $set: { status: "expired" }
  });
}

async function getAvailableSlots(project) {
  await expireInvitations(project._id);

  const pendingCount = await Request.countDocuments({
    project: project._id,
    status: "pending",
    $or: [
      { type: "request" },
      { type: "invite" }
    ]
  });

  const currentMembers = project.members.length + 1;

  return project.teamSize - currentMembers - pendingCount;
}

module.exports = {
  expireInvitations,
  getAvailableSlots
};
