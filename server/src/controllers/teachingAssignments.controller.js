const { TeachingAssignment, Attendance, TimetableEntry, Teacher, Subject, Course, User } = require('../models');
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
  buildFilter: async (req) => {
    const extra = {};
    if (req.user.role === 'teacher' && req.teacherProfile) {
      extra.teacher = req.teacherProfile._id;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      const [matchingUsers, matchingSubjects, matchingCourses] = await Promise.all([
        User.find({ name: regex, role: 'teacher' }).select('_id'),
        Subject.find({ $or: [{ name: regex }, { code: regex }] }).select('_id'),
        Course.find({ $or: [{ name: regex }, { code: regex }] }).select('_id'),
      ]);
      const matchingTeachers = await Teacher.find({ user: { $in: matchingUsers.map((u) => u._id) } }).select('_id');

      extra.$or = [
        { teacher: { $in: matchingTeachers.map((t) => t._id) } },
        { subject: { $in: matchingSubjects.map((s) => s._id) } },
        { course: { $in: matchingCourses.map((c) => c._id) } },
        { section: regex },
      ];
    }

    return extra;
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
