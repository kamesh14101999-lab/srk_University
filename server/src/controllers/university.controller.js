const { UniversityInfo } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

const get = asyncHandler(async (req, res) => {
  let info = await UniversityInfo.findOne();
  if (!info) info = await UniversityInfo.create({});
  res.json(info);
});

const update = asyncHandler(async (req, res) => {
  let info = await UniversityInfo.findOne();
  if (!info) {
    info = await UniversityInfo.create(req.body);
  } else {
    Object.assign(info, req.body);
    await info.save();
  }
  res.json(info);
});

module.exports = { get, update };
