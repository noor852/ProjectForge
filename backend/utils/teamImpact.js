const { teamCoverage } = require("./teamMatching");

// ---------- Feature 9: Team Impact Analysis ----------
// Question answered here: "what happens to the team if THIS student joins?"
// We calculate the team coverage twice: once now, and once with the student added.

function lower(text) {
  return String(text || "").trim().toLowerCase();
}

// roles that are already taken in the team:
// the roles given to the members + the preferred roles of the owner
function coveredRoles(project) {
  const roles = [];

  if (project.owner && project.owner.preferredRoles) {
    for (let i = 0; i < project.owner.preferredRoles.length; i++) {
      roles.push(lower(project.owner.preferredRoles[i]));
    }
  }
  for (let i = 0; i < project.members.length; i++) {
    roles.push(lower(project.members[i].role));
  }
  return roles;
}

// roles the project needs that nobody in the team has yet
function openRoles(project) {
  const taken = coveredRoles(project);
  const open = [];
  const needed = project.rolesNeeded || [];

  for (let i = 0; i < needed.length; i++) {
    if (taken.indexOf(lower(needed[i])) === -1) {
      open.push(needed[i]);
    }
  }
  return open;
}

// project = populated project, team = [owner, ...members] (users), student = the candidate
function teamImpact(project, team, student) {
  const before = teamCoverage(project, team);
  const after = teamCoverage(project, team.concat([student]));

  const closes = [];     // gaps that are fully closed by this student
  const improves = [];   // gaps that become smaller but are not closed
  const overlap = [];    // skills the team already covers and the student has too
  const stillOpen = [];  // gaps that remain even after adding the student

  for (let i = 0; i < before.skills.length; i++) {
    const b = before.skills[i];
    const a = after.skills[i];

    if (b.status !== "covered" && a.status === "covered") {
      closes.push(b.name);
    } else if (a.coverage > b.coverage) {
      improves.push({ name: b.name, from: b.percentage, to: a.percentage });
    }

    if (b.status === "covered" && a.best >= b.minLevel && student.skills.some(function (s) {
      return lower(s.name) === lower(b.name) && s.level >= b.minLevel;
    })) {
      overlap.push(b.name);
    }

    if (a.status !== "covered") {
      stillOpen.push(a.name);
    }
  }

  // roles: does the student prefer a role that is still open?
  const open = openRoles(project);
  const studentRoles = (student.preferredRoles || []).map(lower);
  const newRoles = [];
  for (let i = 0; i < open.length; i++) {
    if (studentRoles.indexOf(lower(open[i])) !== -1) {
      newRoles.push(open[i]);
    }
  }

  const change = after.summary.overallCoverage - before.summary.overallCoverage;

  // overall level of the impact
  let level = "none";
  if (change >= 15 || closes.length >= 2) {
    level = "high";
  } else if (change >= 5 || closes.length === 1) {
    level = "medium";
  } else if (change > 0 || newRoles.length > 0) {
    level = "low";
  }

  // readable notes, same format as the compatibility explanation: { kind: "good" | "warn", text }
  const notes = [];
  if (closes.length > 0) {
    notes.push({ kind: "good", text: "Closes " + closes.length + " skill gap(s): " + closes.join(", ") });
  }
  if (improves.length > 0) {
    const parts = improves.map(function (x) {
      return x.name + " " + x.from + "% to " + x.to + "%";
    });
    notes.push({ kind: "good", text: "Strengthens partly covered skills: " + parts.join(", ") });
  }
  if (newRoles.length > 0) {
    notes.push({ kind: "good", text: "Takes a role nobody has yet: " + newRoles.join(", ") });
  }
  if (overlap.length > 0) {
    notes.push({ kind: "warn", text: "Same strength as the team already has in: " + overlap.join(", ") });
  }
  if (stillOpen.length > 0) {
    notes.push({ kind: "warn", text: "Still missing after joining: " + stillOpen.join(", ") });
  }
  if (project.requiredSkills.length === 0 && open.length === 0) {
    notes.push({ kind: "warn", text: "This project has no required skills or open roles, so the impact cannot be measured" });
  } else if (closes.length === 0 && improves.length === 0 && newRoles.length === 0) {
    notes.push({ kind: "warn", text: "Does not add anything new to the team's skills or roles" });
  }

  // team getting too concentrated: more than half of the skills this student has are already covered
  let concentrated = false;
  if (overlap.length >= 2 && overlap.length > closes.length + improves.length) {
    concentrated = true;
    notes.push({ kind: "warn", text: "The team would become concentrated in the same skill areas" });
  }

  return {
    before: before.summary.overallCoverage,
    after: after.summary.overallCoverage,
    change: change,
    closes: closes,
    improves: improves,
    overlap: overlap,
    stillOpen: stillOpen,
    newRoles: newRoles,
    concentrated: concentrated,
    level: level,
    notes: notes
  };
}

module.exports = { teamImpact, openRoles };