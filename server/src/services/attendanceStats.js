const { Attendance } = require('../models');

function round1(n) {
  return Math.round(n * 10) / 10;
}

// Attendance % for a student, optionally scoped to one subject and/or date range.
async function computePercent({ student, subject, from, to }) {
  const filter = { student };
  if (subject) filter.subject = subject;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const [present, total] = await Promise.all([
    Attendance.countDocuments({ ...filter, status: 'present' }),
    Attendance.countDocuments(filter),
  ]);

  return {
    present,
    total,
    percent: total > 0 ? round1((present / total) * 100) : 0,
  };
}

function indicator(percent, threshold, warning) {
  if (percent >= threshold) return 'green';
  if (percent >= warning) return 'amber';
  return 'red';
}

module.exports = { computePercent, indicator, round1 };
