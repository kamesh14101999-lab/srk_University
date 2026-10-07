const { Setting } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

const DEFAULTS = {
  attendanceThreshold: 75,
  attendanceWarning: 65,
  currentAcademicYear: '',
  passPercent: 40,
};

const get = asyncHandler(async (req, res) => {
  const settings = await Setting.find();
  const map = { ...DEFAULTS };
  for (const s of settings) map[s.key] = s.value;
  res.json(map);
});

const update = asyncHandler(async (req, res) => {
  const updates = req.body;
  const ops = Object.entries(updates).map(([key, value]) => ({
    updateOne: { filter: { key }, update: { value }, upsert: true },
  }));
  if (ops.length > 0) await Setting.bulkWrite(ops);

  const settings = await Setting.find();
  const map = { ...DEFAULTS };
  for (const s of settings) map[s.key] = s.value;
  res.json(map);
});

module.exports = { get, update };
