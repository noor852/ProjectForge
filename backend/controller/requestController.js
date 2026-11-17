const Request = require("../models/Request");
const Project = require("../models/Projects");
const User = require("../models/User");
const updateStatus = require("../utils/teamStatus");

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

// body: { projectId, type: "request" | "invite", studentId (only for invite) }
async function sendRequest(req, res) {
  try {
    const { projectId, type, studentId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }
    if (project.status !== "looking" && project.status !== "forming") {
      return res.status(400).json({ message: "This project is not accepting members." });
    }
    if (project.members.length + 1 >= project.teamSize) {
      return res.status(400).json({ message: "The team is already full." });
    }

    let student;
    if (type === "invite") {
      if (project.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Only the owner can invite students!" });
      }
      student = await User.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found!" });
      }
    } else if (type === "request") {
      student = req.user;
    } else {
      return res.status(400).json({ message: "Type must be request or invite." });
    }

    if (isInTeam(project, student._id)) {
      return res.status(400).json({ message: "This student is already in the team." });
    }

    const existing = await Request.findOne({
      project: project._id,
      student: student._id,
      status: "pending"
    });
    if (existing) {
      return res.status(400).json({ message: "There is already a pending request or invitation." });
    }

    const request = await Request.create({
      project: project._id,
      student: student._id,
      type: type
    });
    res.status(201).json({ request: request });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// received = waiting for an answer, sent = things I started
async function getMyRequests(req, res) {
  try {
    const myProjects = await Project.find({ owner: req.user._id }).select("_id");
    const myProjectIds = myProjects.map(function (p) { return p._id; });

    const received = await Request.find({
      status: "pending",
      $or: [
        { type: "request", project: { $in: myProjectIds } },   // students asking to join my projects
        { type: "invite", student: req.user._id }              // owners inviting me
      ]
    })
      .populate({ path: "project", select: "title owner", populate: { path: "owner", select: "name" } })
      .populate("student", "name")
      .sort({ createdAt: -1 });

    const sent = await Request.find({
      $or: [
        { type: "request", student: req.user._id },            // my join requests
        { type: "invite", project: { $in: myProjectIds } }     // my invitations
      ]
    })
      .populate({ path: "project", select: "title owner", populate: { path: "owner", select: "name" } })
      .populate("student", "name")
      .sort({ createdAt: -1 });

    res.json({ received: received, sent: sent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// body: { action: "accept" | "decline" }
async function respondToRequest(req, res) {
  try {
    const { action } = req.body;
    const request = await Request.findById(req.params.id).populate("project");
    if (!request) {
      return res.status(404).json({ message: "Request not found!" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "This request was already answered." });
    }

    // who is being allowed to answer - should be either me (the owner) or the student i invite
    const me = req.user._id.toString();
    const project = request.project;
    let allowed = false;
    if (request.type === "request" && project.owner.toString() === me) {
      allowed = true;                                   // owner answers join requests
    }
    if (request.type === "invite" && request.student.toString() === me) {
      allowed = true;                                   // student answers invitations
    }
    if (!allowed) {
      return res.status(403).json({ message: "You cannot answer this request!" });
    }

    if (action === "decline") {
      request.status = "declined";
      await request.save();
      return res.json({ request: request });
    }
    if (action !== "accept") {
      return res.status(400).json({ message: "Action must be accept or decline." });
    }

    // accept: re-check, because things may have changed since the request was sent
    if (project.status !== "looking" && project.status !== "forming") {
      return res.status(400).json({ message: "This project is not accepting members." });
    }
    if (project.members.length + 1 >= project.teamSize) {
      return res.status(400).json({ message: "The team is already full." });
    }
    if (isInTeam(project, request.student)) {
      return res.status(400).json({ message: "This student is already in the team." });
    }

    // add to the team (feature 11 manages the team from here)
    const student = await User.findById(request.student);
    let role = "member";
    if (student.preferredRoles.length > 0) {
      role = student.preferredRoles[0];
    }
    project.members.push({ user: student._id, role: role });
    updateStatus(project);
    await project.save();

    request.status = "accepted";
    await request.save();

    // team is full now -> nobody else can join, close the other open requests
    if (project.status === "complete") {
      await Request.updateMany(
        { project: project._id, status: "pending" },
        { status: "declined" }
      );
    }

    res.json({ request: request, projectStatus: project.status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// to delete a request if i want
async function cancelRequest(req, res) {
  try {
    const request = await Request.findById(req.params.id).populate("project");
    if (!request) {
      return res.status(404).json({ message: "Request not found!" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be cancelled." });
    }

    const me = req.user._id.toString();
    let isSender = false;
    if (request.type === "request" && request.student.toString() === me) {
      isSender = true;
    }
    if (request.type === "invite" && request.project.owner.toString() === me) {
      isSender = true;
    }
    if (!isSender) {
      return res.status(403).json({ message: "You did not send this request!" });
    }

    await request.deleteOne();
    res.json({ message: "Cancelled" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { sendRequest, getMyRequests, respondToRequest, cancelRequest };