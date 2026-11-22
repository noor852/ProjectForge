const escapeHtml = require("escape-html");
const Project = require("../models/Projects");

// turns a list into "a, b, c" and escapes every item
function listText(items) {
  if (!items || items.length === 0) {
    return "none";
  }
  const safe = [];
  for (let i = 0; i < items.length; i++) {
    safe.push(escapeHtml(items[i]));
  }
  return safe.join(", ");
}

// public, read-only HTML page of a project (the only place the server sends HTML)
exports.shareProject = async function (req, res) {
  try {
    const project = await Project.findById(req.params.id).populate("owner", "name");
    if (!project || project.status === "draft" || project.status === "archived") {
      return res.status(404).send("<h1>Project " + escapeHtml(req.params.id) + " not found</h1>");
    }

    const skills = [];
    for (let i = 0; i < project.requiredSkills.length; i++) {
      const s = project.requiredSkills[i];
      skills.push(
        escapeHtml(s.name) + " (" + escapeHtml(s.importance) + ", min level " + escapeHtml(String(s.minLevel)) + ")"
      );
    }

    const page =
      "<html><head><title>" + escapeHtml(project.title) + "</title></head><body>" +
      "<h1>" + escapeHtml(project.title) + "</h1>" +
      "<p>" + escapeHtml(project.description) + "</p>" +
      "<p>Domain: " + escapeHtml(project.domain || "not set") + "</p>" +
      "<p>Expected duration: " + escapeHtml(project.expectedDuration || "not set") + "</p>" +
      "<p>Status: " + escapeHtml(project.status) + " | Team size: " + escapeHtml(String(project.teamSize)) + "</p>" +
      "<p>Technologies: " + listText(project.technologies) + "</p>" +
      "<p>Roles needed: " + listText(project.rolesNeeded) + "</p>" +
      "<p>Required skills: " + (skills.length > 0 ? skills.join(", ") : "none") + "</p>" +
      "<p>Owner: " + escapeHtml(project.owner ? project.owner.name : "unknown") + "</p>" +
      "</body></html>";

    res.type("html").send(page);
  } catch (err) {
    res.status(404).send("<h1>Project " + escapeHtml(req.params.id) + " not found</h1>");
  }
};

// makes user text safe to use inside a regular expression
function regexSafe(text) {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

// HTML search page, same idea as the lecture example: /search?q=...
exports.searchPage = async function (req, res) {
  try {
    const q = String(req.query.q || "");

    const filter = { status: { $nin: ["draft", "archived"] } };
    if (q.trim()) {
      const rx = regexSafe(q.trim());
      filter.$or = [{ title: rx }, { description: rx }];
    }
    const projects = await Project.find(filter).sort({ createdAt: -1 }).limit(20);

    let items = "";
    for (let i = 0; i < projects.length; i++) {
      items = items +
        "<li><a href=\"/api/projects/" + escapeHtml(String(projects[i]._id)) + "/share\">" +
        escapeHtml(projects[i].title) + "</a> (" + escapeHtml(projects[i].domain || "no domain") + ")</li>";
    }

    const page =
      "<html><body><h1>Search Results for: " + escapeHtml(q) + "</h1><ul>" +
      (items || "<li>No projects found</li>") + "</ul></body></html>";

    res.type("html").send(page);
  } catch (err) {
    res.status(500).send("<h1>Something went wrong</h1>");
  }
};