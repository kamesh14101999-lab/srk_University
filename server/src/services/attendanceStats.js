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

// Attendance % for many students in a single aggregation query, instead of one query per
// student. Returns a Map keyed by student id (string) -> { present, total, percent }.
// Students with zero attendance records are NOT included in the map — treat a missing key as 0%.
async function computePercentForStudents(studentIds) {
  if (!studentIds || studentIds.length === 0) return new Map();

  const rows = await Attendance.aggregate([
    { $match: { student: { $in: studentIds } } },
    {
      $group: {
        _id: '$student',
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
      },
    },
  ]);

  const map = new Map();
  for (const row of rows) {
    map.set(row._id.toString(), {
      present: row.present,
      total: row.total,
      percent: row.total > 0 ? round1((row.present / row.total) * 100) : 0,
    });
  }
  return map;
}

module.exports = { computePercent, computePercentForStudents, indicator, round1 };
