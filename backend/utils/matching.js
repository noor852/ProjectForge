// Compatibility between a project and a student.
// Every factor gives { earned, max }. A factor only counts when the project
// actually defines it, so a project without roles or technologies is not punished.

const WEIGHTS = {
  skills: 60,
  roles: 10,
  technologies: 10,
  interests: 5,
  availability: 10,
  experience: 5
};

const EXPERIENCE_LEVEL = { beginner: 2, intermediate: 3, advanced: 5 };
const MIN_HOURS = 10; // hours per week we expect from a teammate

function lower(text) {
  return String(text || "").trim().toLowerCase();
}

function findSkill(student, name) {
  let found = null;
  for (let i = 0; i < student.skills.length; i++) {
    if (lower(student.skills[i].name) === lower(name)) {
      found = student.skills[i];
    }
  }
  return found;
}

function calcScore(project, student) {
  const needs = project.requiredSkills || [];
  const missing = [];
  const factors = {};

  // 1. skills + proficiency (essential skills count double)
  if (needs.length > 0) {
    let total = 0;
    let got = 0;
    for (let i = 0; i < needs.length; i++) {
      const need = needs[i];
      const weight = need.importance === "essential" ? 2 : 1;
      total = total + weight;

      const found = findSkill(student, need.name);
      if (found === null) {
        missing.push(need.name);
      } else {
        let ratio = found.level / need.minLevel;
        if (ratio > 1) {
          ratio = 1;
        }
        got = got + ratio * weight;
        if (found.level < need.minLevel) {
          missing.push(need.name);
        }
      }
    }
    factors.skills = { ratio: got / total, matched: [] };
  }

  // 2. preferred roles vs roles the project needs
  const rolesNeeded = project.rolesNeeded || [];
  if (rolesNeeded.length > 0) {
    const matchedRoles = [];
    for (let i = 0; i < rolesNeeded.length; i++) {
      if ((student.preferredRoles || []).map(lower).indexOf(lower(rolesNeeded[i])) !== -1) {
        matchedRoles.push(lower(rolesNeeded[i]));
      }
    }
    factors.roles = { ratio: matchedRoles.length > 0 ? 1 : 0, matched: matchedRoles };
  }

  // 3. technologies the student already uses
  const projectTech = project.technologies || [];
  if (projectTech.length > 0) {
    const matchedTech = [];
    const studentTech = (student.technologies || []).map(lower);
    for (let i = 0; i < projectTech.length; i++) {
      if (studentTech.indexOf(lower(projectTech[i])) !== -1) {
        matchedTech.push(lower(projectTech[i]));
      }
    }
    factors.technologies = { ratio: matchedTech.length / projectTech.length, matched: matchedTech };
  }

  // 4. interests vs the project domain
  const domain = lower(project.domain);
  if (domain) {
    const matchedInterests = [];
    const interests = student.interests || [];
    for (let i = 0; i < interests.length; i++) {
      const interest = lower(interests[i]);
      if (interest && (domain.indexOf(interest) !== -1 || interest.indexOf(domain) !== -1)) {
        matchedInterests.push(interest);
      }
    }
    factors.interests = { ratio: matchedInterests.length > 0 ? 1 : 0, matched: matchedInterests };
  }

  // 5. availability (hours per week)
  let hoursRatio = (student.availability || 0) / MIN_HOURS;
  if (hoursRatio > 1) {
    hoursRatio = 1;
  }
  factors.availability = { ratio: hoursRatio, matched: [] };

  // 6. experience compared with how demanding the required skills are
  if (needs.length > 0) {
    let sum = 0;
    for (let i = 0; i < needs.length; i++) {
      sum = sum + (needs[i].minLevel || 1);
    }
    const average = sum / needs.length;
    let expRatio = (EXPERIENCE_LEVEL[student.experience] || 2) / average;
    if (expRatio > 1) {
      expRatio = 1;
    }
    factors.experience = { ratio: expRatio, matched: [] };
  }

  // combine only the factors that apply
  let earned = 0;
  let max = 0;
  const breakdown = {};
  const names = Object.keys(factors);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    earned = earned + factors[name].ratio * WEIGHTS[name];
    max = max + WEIGHTS[name];
    breakdown[name] = {
      percent: Math.round(factors[name].ratio * 100),
      weight: WEIGHTS[name],
      matched: factors[name].matched
    };
  }

  let score = 0;
  if (max > 0) {
    score = Math.round((earned / max) * 100);
  }
  return { score: score, missingSkills: missing, breakdown: breakdown };
}

module.exports = calcScore;