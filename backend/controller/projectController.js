const Project = require("../models/Projects");
const User = require("../models/User");
const calcScore = require("../utils/matching");

// body se sirf wahi fields lo jo allowed hain
function getFields(body) {
  return {
    title: body.title,
    description: body.description,
    domain: body.domain,
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
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      getFields(req.body),
      { new: true, runValidators: true }
    );
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

    const search = (req.query.search || "").toLowerCase().trim();
    const experience = req.query.experience || "";

    // jo pehle se team me hain unhe nikal do
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
        missingSkills: r.missingSkills
      });
    }

    // sabse zyada score wala pehle
    result.sort(function (a, b) {
      return b.score - a.score;
    });

    res.json({ project: { _id: project._id, title: project.title }, candidates: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
module.exports = { createProject, getMyProjects, getProject, updateProject, deleteProject, getCandidates };