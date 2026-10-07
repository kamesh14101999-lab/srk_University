const { GradingRule } = require('../models');

async function gradeFor(percent) {
  const rules = await GradingRule.find().sort({ minPercent: -1 });
  for (const rule of rules) {
    if (percent >= rule.minPercent) return { grade: rule.grade, gradePoint: rule.gradePoint };
  }
  return { grade: 'F', gradePoint: 0 };
}

module.exports = { gradeFor };
