const calcScore = require("./matching");

function weightOf(skill) {
  return skill.importance === "essential" ? 2 : 1;   
}

function levelOf(person, skillName) {
  let best = 0;

  for (let i = 0; i < person.skills.length; i++) {
    if (
      person.skills[i].name.trim().toLowerCase() ===
      skillName.trim().toLowerCase()
    ) {
      if (person.skills[i].level > best) {
        best = person.skills[i].level;
      }
    }
  }

  return best;
}


function teamCoverage(project, team) {
  const result = [];

  let totalWeight = 0;
  let coveredWeight = 0;

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

    const weight = weightOf(need);

    totalWeight += weight;
    coveredWeight += weight * coverage;

    result.push({
      name: need.name,
      importance: need.importance,
      minLevel: need.minLevel,
      best: best,
      coverage: coverage,
      percentage: Math.round(coverage * 100),
      status: status,
      priority:
        status === "covered"
          ? "none"
          : need.importance === "essential"
          ? "high"
          : "medium"
    });
  }

  const covered = result.filter(function (s) {
    return s.status === "covered";
  }).length;

  const partial = result.filter(function (s) {
    return s.status === "partial";
  }).length;

  const missing = result.filter(function (s) {
    return s.status === "missing";
  }).length;

  const gaps = result
    .filter(function (s) {
      return s.status !== "covered";
    })
    .sort(function (a, b) {
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (b.priority === "high" && a.priority !== "high") return 1;
      return 0;
    });

  const overallCoverage =
    totalWeight > 0
      ? Math.round((coveredWeight / totalWeight) * 100)
      : 100;

  return {
    skills: result,
    summary: {
      total: result.length,
      covered: covered,
      partial: partial,
      missing: missing,
      overallCoverage: overallCoverage,
      essentialGaps: gaps.filter(function (s) {
        return s.importance === "essential";
      }).length
    },
    gaps: gaps
  };
}


function teamAwareScore(project, student, coverageData) {
  const coverage = coverageData.skills;
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