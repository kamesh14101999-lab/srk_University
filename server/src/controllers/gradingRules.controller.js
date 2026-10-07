const { GradingRule } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const rules = await GradingRule.find().sort({ minPercent: -1 });
  res.json(rules);
});

const replaceAll = asyncHandler(async (req, res) => {
  const { rules } = req.body;
  if (!Array.isArray(rules) || rules.length === 0) {
    throw ApiError.badRequest('rules must be a non-empty array');
  }
  for (const r of rules) {
    if (typeof r.minPercent !== 'number' || !r.grade || typeof r.gradePoint !== 'number') {
      throw ApiError.badRequest('Each rule needs minPercent, grade, and gradePoint');
    }
  }

  await GradingRule.deleteMany({});
  const created = await GradingRule.insertMany(rules);
  res.json(created.sort((a, b) => b.minPercent - a.minPercent));
});

module.exports = { list, replaceAll };
