const Project = require("../models/Projects");
const User = require("../models/User");
const calcScore = require("../utils/matching");
const explainMatch = require("../utils/explain");
const updateStatus = require("../utils/teamStatus");
const { cleanText } = require("../middleware/sanitize");

// take only the allowed fields from the request body
function getFields(body) {
  return {
    title: body.title,
    description: body.description,
    domain: body.domain,
    expectedDuration: body.expectedDuration,
    teamSize: body.teamSize,
    technologies: body.technologies,
    rolesNeeded: body.rolesNeeded,
    requiredSkills: body.requiredSkills,
    status: body.status
  };
}

async function createProject(req, res) {
  try {
    const fields = getFields(req.body);
    fields.owner = req.user._id;
    // forming and complete are automatic, a new project cannot start with them
    if (fields.status === "forming" || fields.status === "complete") {
      fields.status = "looking";
    }
    const project = await Project.create(fields);
    res.status(201).json({ project: project });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getMyProjects(req, res) {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ projects: projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getProject(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }
    res.json({ project: project });
  } catch (err) {
    res.status(404).json({ message: "Project not found!" });
  }
}

async function updateProject(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can edit this project!" });
    }

    const fields = getFields(req.body);

    // the team size cannot be smaller than the people already in the team (owner counts too)
    const teamCount = project.members.length + 1;
    if (fields.teamSize !== undefined && Number(fields.teamSize) < teamCount) {
      return res.status(400).json({
        message: "Team size cannot be smaller than the current team (" + teamCount + ")."
      });
    }

    // forming and complete are automatic, the owner cannot set them by hand
    if ((fields.status === "forming" || fields.status === "complete") && fields.status !== project.status) {
      return res.status(400).json({
        message: "Forming and complete are set automatically from the team size."
      });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      fields,
      { new: true, runValidators: true }
    );

    // recalculate the automatic status (for example the team became full after a team size change)
    updateStatus(updated);
    await updated.save();

    res.json({ project: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteProject(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can delete this project!" });
    }
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getCandidates(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can see candidates!" });
    }

    const search = cleanText(String(req.query.search || "")).toLowerCase();
    const experience = cleanText(String(req.query.experience || ""));

    // skip students who are already in the team
    const memberIds = project.members.map(function (m) {
      return m.user.toString();
    });

    const users = await User.find({ _id: { $ne: req.user._id } });
    const result = [];

    for (let i = 0; i < users.length; i++) {
      const u = users[i];

      if (memberIds.indexOf(u._id.toString()) !== -1) {
        continue;
      }
      if (experience && u.experience !== experience) {
        continue;
      }
      if (search) {
        const skillNames = u.skills.map(function (s) { return s.name; });
        const text = [u.name]
          .concat(u.technologies, u.preferredRoles, u.interests, skillNames)
          .join(" ")
          .toLowerCase();
        if (text.indexOf(search) === -1) {
          continue;
        }
      }

      const r = calcScore(project, u);
      result.push({
        _id: u._id,
        name: u.name,
        bio: u.bio,
        experience: u.experience,
        availability: u.availability,
        technologies: u.technologies,
        preferredRoles: u.preferredRoles,
        skills: u.skills,
        score: r.score,
        missingSkills: r.missingSkills,
        reasons: explainMatch(project, u, r)
      });
    }

    // highest score first
    result.sort(function (a, b) {
      return b.score - a.score;
    });

    res.json({ project: { _id: project._id, title: project.title }, candidates: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createProject, getMyProjects, getProject, updateProject, deleteProject, getCandidates };