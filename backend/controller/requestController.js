const Request = require("../models/Request");
const Project = require("../models/Projects");
const User = require("../models/User");
const { isInTeam, addMemberToTeam } = require("./teamController");

// ---------- Feature 10: send a join request or an invitation ----------
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

// ---------- Feature 10: my inbox ----------
// received = waiting for MY answer, sent = things I started
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

// ---------- Feature 10: accept or decline ----------
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

    // who is allowed to answer?
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

    // accept: feature 11 creates the membership (and checks the team size limit)
    const student = await User.findById(request.student);
    let role = "member";
    if (student.preferredRoles.length > 0) {
      role = student.preferredRoles[0];          // owner can change it later (feature 11)
    }
    const problem = addMemberToTeam(project, student._id, role);
    if (problem) {
      return res.status(400).json({ message: problem });
    }
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

// ---------- Feature 10: cancel something I sent ----------
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