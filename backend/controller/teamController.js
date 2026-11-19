const Project = require("../models/Projects");
const updateStatus = require("../utils/teamStatus");

// team membership 

function isInTeam(project, userId) {
  if (project.owner.toString() === userId.toString()) {
    return true;
  }
  for (let i = 0; i < project.members.length; i++) {
    if (project.members[i].user.toString() === userId.toString()) {
      return true;
    }
  }
  return false;
}

// Creates a team membership, feature 10 calls this when a request/invite is accepted and enforces the team size limit. Returns an error message, or null if it worked.
function addMemberToTeam(project, studentId, role) {
  if (project.status !== "looking" && project.status !== "forming") {
    return "This project is not accepting members.";
  }
  if (project.members.length + 1 >= project.teamSize) {      // + 1 = the owner
    return "The team is already full.";
  }
  if (isInTeam(project, studentId)) {
    return "This student is already in the team.";
  }

  project.members.push({ user: studentId, role: role || "member" });
  updateStatus(project);                                     // may become "forming" or "complete" depending on total members in the projecy
  return null;
}

// assign or change a member's role: PUT /api/projects/:id/members/:userId  body { role }
async function updateRole(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can assign roles!" });
    }

    const role = String(req.body.role || "").trim().toLowerCase();
    if (!role || role.length > 30) {
      return res.status(400).json({ message: "Role must be 1 to 30 characters." });
    }

    let found = false;
    for (let i = 0; i < project.members.length; i++) {
      if (project.members[i].user.toString() === req.params.userId) {
        project.members[i].role = role;
        found = true;
      }
    }
    if (!found) {
      return res.status(404).json({ message: "This student is not a member." });
    }

    await project.save();
    res.json({ message: "Role updated", role: role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// remove a member / leave the team: DELETE /api/projects/:id/members/:userId
// the owner can remove anyone, but a member can only remove themselves
async function removeMember(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }

    const me = req.user._id.toString();
    const target = req.params.userId;
    const isOwner = project.owner.toString() === me;

    if (!isOwner && target !== me) {
      return res.status(403).json({ message: "You can only leave the team yourself!" });
    }
    if (target === project.owner.toString()) {
      return res.status(400).json({ message: "The owner cannot be removed from the team." });
    }

    const before = project.members.length;
    project.members = project.members.filter(function (m) {
      return m.user.toString() !== target;
    });
    if (project.members.length === before) {
      return res.status(404).json({ message: "This student is not a member." });
    }

    updateStatus(project);      // a free spot can reopen a "complete" team
    await project.save();

    res.json({ message: "Member removed", status: project.status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { isInTeam, addMemberToTeam, updateRole, removeMember };