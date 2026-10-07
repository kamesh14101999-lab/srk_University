const { TeachingAssignment, Attendance, TimetableEntry } = require('../models');
const { crudFactory } = require('../utils/crudFactory');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

const base = crudFactory(TeachingAssignment, {
  populate: [
    { path: 'teacher', select: 'employeeId user', populate: { path: 'user', select: 'name' } },
    { path: 'subject', select: 'name code semester' },
    { path: 'course', select: 'name code' },
    { path: 'academicYear', select: 'label' },
  ],
  filterFields: ['teacher', 'subject', 'course', 'semester', 'section', 'academicYear'],
  buildFilter: (req) => {
    if (req.user.role === 'teacher' && req.teacherProfile) {
      return { teacher: req.teacherProfile._id };
    }
    return {};
  },
  blockDeleteRefs: [
    { model: Attendance, field: 'assignment', label: 'attendance record' },
    { model: TimetableEntry, field: 'assignment', label: 'timetable entry' },
  ],
});

const getOne = asyncHandler(async (req, res) => {
  const doc = await TeachingAssignment.findById(req.params.id).populate([
    { path: 'teacher', select: 'employeeId user', populate: { path: 'user', select: 'name' } },
    { path: 'subject', select: 'name code semester' },
    { path: 'course', select: 'name code' },
    { path: 'academicYear', select: 'label' },
  ]);
  if (!doc) throw ApiError.notFound('TeachingAssignment not found');
  if (req.user.role === 'teacher' && doc.teacher._id.toString() !== req.teacherProfile?._id.toString()) {
    throw ApiError.forbidden('Not your teaching assignment');
  }
  res.json(doc);
});

module.exports = { ...base, getOne };
