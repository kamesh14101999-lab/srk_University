const { AcademicYear, Exam, Result, TeachingAssignment } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

const base = crudFactory(AcademicYear, {
  searchFields: ['label'],
  filterFields: ['isCurrent'],
  blockDeleteRefs: [
    { model: Exam, field: 'academicYear', label: 'exam' },
    { model: Result, field: 'academicYear', label: 'result' },
    { model: TeachingAssignment, field: 'academicYear', label: 'teaching assignment' },
  ],
});

const asyncHandler = require('../middleware/asyncHandler');

// Setting one year current unsets any previously current year.
const create = asyncHandler(async (req, res) => {
  if (req.body.isCurrent) {
    await AcademicYear.updateMany({}, { isCurrent: false });
  }
  const doc = await AcademicYear.create(req.body);
  res.status(201).json(doc);
});

const update = asyncHandler(async (req, res) => {
  if (req.body.isCurrent) {
    await AcademicYear.updateMany({ _id: { $ne: req.params.id } }, { isCurrent: false });
  }
  const doc = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    const ApiError = require('../utils/ApiError');
    throw ApiError.notFound('AcademicYear not found');
  }
  res.json(doc);
});

module.exports = { ...base, create, update };
