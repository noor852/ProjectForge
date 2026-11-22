// Turns a match result into short, readable reasons.
// Each reason is { kind: "good" | "warn", text }.
// result = what calcScore() returned, extra = optional { fills, overlap } from team-aware matching.

function lower(text) {
  return String(text || "").trim().toLowerCase();
}

function explainMatch(project, student, result, extra) {
  const reasons = [];
  const b = result.breakdown || {};

  // skills and proficiency, one look at every required skill
  const needs = project.requiredSkills || [];
  const strong = [];
  const weak = [];
  const missing = [];
  for (let i = 0; i < needs.length; i++) {
    let level = 0;
    for (let j = 0; j < student.skills.length; j++) {
      if (lower(student.skills[j].name) === lower(needs[i].name)) {
        level = student.skills[j].level;
      }
    }
    if (level === 0) {
      missing.push(needs[i].name);
    } else if (level >= needs[i].minLevel) {
      strong.push(needs[i].name + " " + level + "/5");
    } else {
      weak.push(needs[i].name + " " + level + "/5, needs " + needs[i].minLevel);
    }
  }
  if (strong.length > 0) {
    reasons.push({
      kind: "good",
      text: "Meets the required level in " + strong.length + " of " + needs.length +
        " skills: " + strong.join(", ")
    });
  }
  if (weak.length > 0) {
    reasons.push({ kind: "warn", text: "Below the required level: " + weak.join("; ") });
  }
  if (missing.length > 0) {
    reasons.push({ kind: "warn", text: "Does not list: " + missing.join(", ") });
  }

  // roles
  if (b.roles) {
    if (b.roles.matched.length > 0) {
      reasons.push({
        kind: "good",
        text: "Prefers a role the project needs: " + b.roles.matched.join(", ")
      });
    } else {
      reasons.push({ kind: "warn", text: "None of the preferred roles match the roles the project needs" });
    }
  }

  // technologies
  if (b.technologies) {
    if (b.technologies.matched.length > 0) {
      reasons.push({
        kind: "good",
        text: "Already works with " + b.technologies.matched.join(", ") +
          " (" + b.technologies.percent + "% of the project technologies)"
      });
    } else {
      reasons.push({ kind: "warn", text: "Does not list any of the project technologies" });
    }
  }

  // interests
  if (b.interests && b.interests.matched.length > 0) {
    reasons.push({
      kind: "good",
      text: "Interested in " + b.interests.matched.join(", ") + ", which fits the " + project.domain + " domain"
    });
  }

  // availability
  if (b.availability) {
    if (b.availability.percent >= 100) {
      reasons.push({ kind: "good", text: "Available " + student.availability + " hrs/week" });
    } else {
      reasons.push({ kind: "warn", text: "Limited availability: " + student.availability + " hrs/week" });
    }
  }

  // experience
  if (b.experience) {
    if (b.experience.percent >= 100) {
      reasons.push({
        kind: "good",
        text: "Experience level (" + student.experience + ") suits the skill levels this project asks for"
      });
    } else {
      reasons.push({
        kind: "warn",
        text: "Experience level (" + student.experience + ") is low for the skill levels this project asks for"
      });
    }
  }

  // team-aware extras
  if (extra && extra.fills && extra.fills.length > 0) {
    reasons.push({ kind: "good", text: "Fills current team gaps: " + extra.fills.join(", ") });
  }
  if (extra && extra.overlap && extra.overlap.length > 0) {
    reasons.push({ kind: "warn", text: "The team already covers: " + extra.overlap.join(", ") });
  }

  return reasons;
}

module.exports = explainMatch;