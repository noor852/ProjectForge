function calcScore(project, student) {
  let total = 0;
  let got = 0;
  const missing = [];

  for (let i = 0; i < project.requiredSkills.length; i++) {
    const need = project.requiredSkills[i];
    const weight = need.importance === "essential" ? 2 : 1;
    total = total + weight;

    let found = null;
    for (let j = 0; j < student.skills.length; j++) {
      if (student.skills[j].name.trim().toLowerCase() === need.name.toLowerCase()) {
        found = student.skills[j];
      }
    }

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

  let score = 0;
  if (total > 0) {
    score = Math.round((got / total) * 100);
  }
  return { score: score, missingSkills: missing };
}

module.exports = calcScore;