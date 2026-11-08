const Project = require("../models/Projects");
const User = require("../models/User");
const { teamCoverage, teamAwareScore } = require("../utils/teamMatching");

const PAGE_SIZE = 6;

function toList(text) {
  return text.split(",").map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
}

function safeRegex(text) {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

async function getProjects(req, res) {
  try {
    const { search, domain, skills, status } = req.query;
    // for safer paging and no crashing
    const page = Math.max(Number(req.query.page) || 1, 1);

    const filter = {};
    filter.status = status ? status : { $ne: "draft" };    
    if (domain) {
      filter.domain = safeRegex(domain);
    }
    if (search) {
      const rx = safeRegex(search);
      filter.$or = [{ title: rx }, { description: rx }];
    }
    if (skills) {
      filter["requiredSkills.name"] = { $in: toList(skills) };
    }

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate("owner", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    res.json({
      projects: projects,
      total: total,
      page: page,
      pages: Math.ceil(total / PAGE_SIZE)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getProjectDetail(req, res) {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name")
      .populate("members.user", "name");
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    res.json({ project: project, isOwner: isOwner });
  } catch (err) {
    res.status(404).json({ message: "Project not found!" });
  }
}

// ---------- Feature 7: team-aware matching ----------
async function getTeamCandidates(req, res) {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner")
      .populate("members.user");
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }
    if (project.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can see suggestions!" });
    }
    if (project.status === "complete" || project.status === "in_progress") {
      return res.status(400).json({ message: "This team is already complete." });
    }

    // team = owner + members (the owner counts as a team member)
    const team = [project.owner];
    const teamIds = [project.owner._id.toString()];
    for (let i = 0; i < project.members.length; i++) {
      team.push(project.members[i].user);
      teamIds.push(project.members[i].user._id.toString());
    }

    const coverage = teamCoverage(project, team);

    const users = await User.find({});
    const candidates = [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      if (teamIds.indexOf(u._id.toString()) !== -1) {
        continue;                                  // already in the team
      }
      const r = teamAwareScore(project, u, coverage);
      candidates.push({
        _id: u._id,
        name: u.name,
        experience: u.experience,
        availability: u.availability,
        skills: u.skills,
        score: r.score,
        baseScore: r.baseScore,
        gapScore: r.gapScore,
        fills: r.fills,
        overlap: r.overlap
      });
    }

    candidates.sort(function (a, b) {
      return b.score - a.score;
    });

    res.json({
      project: { _id: project._id, title: project.title, teamSize: project.teamSize, teamCount: team.length },
      coverage: coverage,
      candidates: candidates.slice(0, 20)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getProjects, getProjectDetail, getTeamCandidates };