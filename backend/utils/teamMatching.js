const calcScore = require("./matching");

function weightOf(skill) {
  return skill.importance === "essential" ? 2 : 1;   
}

function levelOf(person, skillName) {
  for (let i = 0; i < person.skills.length; i++) {
    if (person.skills[i].name.toLowerCase() === skillName.toLowerCase()) {
      return person.skills[i].level;
    }
  }
  return 0;
}

function teamCoverage(project, team) {
  const result = [];
  for (let i = 0; i < project.requiredSkills.length; i++) {
    const need = project.requiredSkills[i];

    let best = 0;
    for (let j = 0; j < team.length; j++) {
      const lvl = levelOf(team[j], need.name);
      if (lvl > best) {
        best = lvl;
      }
    }

    let coverage = best / need.minLevel;
    if (coverage > 1) {
      coverage = 1;
    }

    let status = "missing";
    if (coverage >= 1) {
      status = "covered";
    } else if (coverage > 0) {
      status = "partial";
    }

    result.push({
      name: need.name,
      importance: need.importance,
      minLevel: need.minLevel,
      best: best,
      coverage: coverage,
      status: status
    });
  }
  return result;
}

function teamAwareScore(project, student, coverage) {
  const base = calcScore(project, student).score / 100;   

  let gapGot = 0;
  let gapTotal = 0;
  const fills = [];     
  const overlap = [];   

  for (let i = 0; i < coverage.length; i++) {
    const c = coverage[i];
    const w = weightOf(c);
    const level = levelOf(student, c.name);

    let fit = level / c.minLevel;
    if (fit > 1) {
      fit = 1;
    }

    const gap = 1 - c.coverage;          
    gapTotal = gapTotal + w * gap;
    gapGot = gapGot + w * gap * fit;

    if (gap > 0 && level >= c.minLevel) {
      fills.push(c.name);
    }
    if (gap === 0 && level >= c.minLevel) {
      overlap.push(c.name);
    }
  }

  
  let gapScore = base;
  if (gapTotal > 0) {
    gapScore = gapGot / gapTotal;
  }

  const total = 0.4 * base + 0.6 * gapScore;

  return {
    score: Math.round(total * 100),
    baseScore: Math.round(base * 100),
    gapScore: Math.round(gapScore * 100),
    fills: fills,
    overlap: overlap
  };
}

module.exports = { teamCoverage, teamAwareScore };