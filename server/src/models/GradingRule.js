const mongoose = require('mongoose');

const gradingRuleSchema = new mongoose.Schema(
  {
    minPercent: { type: Number, required: true },
    grade: { type: String, required: true },
    gradePoint: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GradingRule', gradingRuleSchema);
