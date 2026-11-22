const Project = require("../models/Projects");
const User = require("../models/User");
const Request = require("../models/Request");
const calcScore = require("../utils/matching");
const explainMatch = require("../utils/explain");
const { teamCoverage, teamAwareScore } = require("../utils/teamMatching");
const { teamImpact, openRoles } = require("../utils/teamImpact");
const { cleanText } = require("../middleware/sanitize");

const PAGE_SIZE = 6;

function clean(value) {
  return value ? cleanText(String(value)) : "";
}

function toList(text) {
  return text.split(",").map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
}

function safeRegex(text) {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

// whole word, case-insensitive (so "react" does not match "preact")
function exactRegex(text) {
  return new RegExp("^" + text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
}

async function getProjects(req, res) {
  try {
    const search = clean(req.query.search);
    const domain = clean(req.query.domain);
    const skills = clean(req.query.skills);
    const status = clean(req.query.status);
    const technologies = clean(req.query.technologies);
    const teamSize = Number(req.query.teamSize);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const filter = {};
    filter.status = status ? status : { $nin: ["draft", "archived"] };   // drafts and archived stay private
    if (status === "draft" || status === "archived") {
      filter.owner = req.user._id;   // show only my own
    }
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

    if (technologies) {
      filter.technologies = { $in: toList(technologies).map(exactRegex) };
    }
    if (teamSize >= 2 && teamSize <= 4) {
      filter.teamSize = teamSize;
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
      .populate("owner", "name skills preferredRoles")
      .populate("members.user", "name skills");
    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    }

    const me = req.user._id.toString();
    const isOwner = project.owner._id.toString() === me;

    let isMember = false;
    const team = [project.owner];
    for (let i = 0; i < project.members.length; i++) {
      team.push(project.members[i].user);
      if (project.members[i].user._id.toString() === me) {
        isMember = true;
      }
    }

    const coverage = teamCoverage(project, team);

    let openSpots = project.teamSize - team.length;
    if (openSpots < 0) {
      openSpots = 0;
    }

    const pending = await Request.findOne({
      project: project._id,
      student: req.user._id,
      status: "pending"
    });

    res.json({
      project: project,
      isOwner: isOwner,
      isMember: isMember,
      meId: me,
      pendingType: pending ? pending.type : null,
      coverage: coverage.skills,
      summary: coverage.summary,
      gaps: coverage.gaps,
      openSpots: openSpots,
      openRoles: openRoles(project)
    });
  } catch (err) {
    res.status(404).json({ message: "Project not found!" });
  }
}

async function getStudentProjects(req, res) {
  try {
    const id = req.params.id;
    const owned = await Project.find({ owner: id, status: { $nin: ["draft", "archived"] } })
      .select("title status");
    const joined = await Project.find({ "members.user": id, status: { $nin: ["draft", "archived"] } })
      .select("title status owner")
      .populate("owner", "name");
    res.json({ owned: owned, joined: joined });
  } catch (err) {
    res.status(404).json({ message: "Student not found!" });
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
    if (project.status === "complete" || project.status === "in_progress" || project.status === "archived") {
      return res.status(400).json({ message: "This project is not looking for members." });
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
      const base = calcScore(project, u);
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
        overlap: r.overlap,
        reasons: explainMatch(project, u, base, { fills: r.fills, overlap: r.overlap }),
        impact: teamImpact(project, team, u)        // Feature 9
      });
    }

    candidates.sort(function (a, b) {
      return b.score - a.score;
    });

    res.json({
      project: {
        _id: project._id,
        title: project.title,
        teamSize: project.teamSize,
        teamCount: team.length
      },
      coverage: coverage.skills,
      summary: coverage.summary,
      gaps: coverage.gaps,
      candidates: candidates.slice(0, 20)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


// ---------- Feature 5: recommend projects to the logged-in student ----------
// GET /api/projects/recommended
// Every open project gets a team-aware score for ME, so a project whose gaps I can fill ranks higher.
async function getRecommendations(req, res) {
  try {
    const me = req.user;
    const myId = me._id.toString();

    const projects = await Project.find({
      status: { $in: ["looking", "forming"] },
      owner: { $ne: me._id },
      "members.user": { $ne: me._id }
    })
      .populate("owner", "name skills preferredRoles")
      .populate("members.user", "name skills")
      .sort({ createdAt: -1 })
      .limit(100);

    // projects where I already have something pending
    const pending = await Request.find({ student: me._id, status: "pending" });
    const pendingIds = pending.map(function (r) { return r.project.toString(); });

    const result = [];
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];

      const team = [p.owner];
      for (let j = 0; j < p.members.length; j++) {
        team.push(p.members[j].user);
      }

      const coverage = teamCoverage(p, team);
      const r = teamAwareScore(p, me, coverage);
      const base = calcScore(p, me);

      let openSpots = p.teamSize - team.length;
      if (openSpots < 0) {
        openSpots = 0;
      }

      result.push({
        _id: p._id,
        title: p.title,
        domain: p.domain,
        status: p.status,
        owner: p.owner.name,
        teamCount: team.length,
        teamSize: p.teamSize,
        openSpots: openSpots,
        requiredSkills: p.requiredSkills,
        score: r.score,
        fills: r.fills,
        pending: pendingIds.indexOf(p._id.toString()) !== -1,
        reasons: explainMatch(p, me, base, { fills: r.fills, overlap: r.overlap })
      });
    }

    result.sort(function (a, b) {
      return b.score - a.score;
    });

    res.json({
      profileEmpty: me.skills.length === 0,
      projects: result.slice(0, 6)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getProjects, getProjectDetail, getStudentProjects, getTeamCandidates, getRecommendations };