const Invitation = require("../models/Invitation");
const Project = require("../models/Projects");
const User = require("../models/User");

// owner invites a student to a project
exports.sendInvitation = async function (req, res) {
  try {
    const { projectId, studentId, role, message } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can send invitations!" });
    }
    if (studentId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot invite yourself!" });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found!" });
    }

    for (let i = 0; i < project.members.length; i++) {
      if (project.members[i].user.toString() === studentId) {
        return res.status(400).json({ message: "This student is already in the team!" });
      }
    }
    if (project.members.length >= project.teamSize) {
      return res.status(400).json({ message: "Team is already full!" });
    }

    const existing = await Invitation.findOne({
      project: projectId,
      student: studentId,
      status: "pending"
    });
    if (existing) {
      return res.status(400).json({ message: "Invitation already sent!" });
    }

    const invitation = await Invitation.create({
      project: projectId,
      student: studentId,
      owner: req.user._id,
      role: role,
      message: message
    });

    res.status(201).json({ invitation: invitation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// invitations I received
exports.getReceived = async function (req, res) {
  try {
    const invitations = await Invitation.find({ student: req.user._id })
      .populate("project", "title description")
      .populate("owner", "name")
      .sort({ createdAt: -1 });
    res.json({ invitations: invitations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// invitations I sent
exports.getSent = async function (req, res) {
  try {
    const invitations = await Invitation.find({ owner: req.user._id })
      .populate("project", "title")
      .populate("student", "name")
      .sort({ createdAt: -1 });
    res.json({ invitations: invitations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// student accepts or declines
exports.respondToInvitation = async function (req, res) {
  try {
    const status = req.body.status;
    if (status !== "accepted" && status !== "declined") {
      return res.status(400).json({ message: "Status must be accepted or declined!" });
    }

    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found!" });
    }
    if (invitation.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This invitation is not for you!" });
    }
    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation already answered!" });
    }

    if (status === "accepted") {
      const project = await Project.findById(invitation.project);
      if (!project) {
        return res.status(404).json({ message: "Project not found!" });
      }
      if (project.members.length >= project.teamSize) {
        return res.status(400).json({ message: "Team is already full!" });
      }
      project.members.push({ user: req.user._id, role: invitation.role });
      if (project.members.length >= project.teamSize) {
        project.status = "complete";
      }
      await project.save();
    }

    invitation.status = status;
    await invitation.save();
    res.json({ invitation: invitation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// owner cancels a pending invitation
exports.cancelInvitation = async function (req, res) {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found!" });
    }
    if (invitation.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the sender can cancel!" });
    }
    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Only pending invitations can be cancelled!" });
    }
    await invitation.deleteOne();
    res.json({ message: "Invitation cancelled" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};