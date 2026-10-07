const { Result, Notification } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination } = require('../utils/crudFactory');
const { generateResultsForClass } = require('../services/results');
const { getTeacherStudentIds } = require('../services/scope');

const populateFields = [
  { path: 'student', select: 'user studentId rollNumber', populate: { path: 'user', select: 'name' } },
  { path: 'course', select: 'name code' },
  { path: 'academicYear', select: 'label' },
  { path: 'subjects.subject', select: 'name code' },
];

const generate = asyncHandler(async (req, res) => {
  const { course, semester, academicYear } = req.body;
  if (!course || !semester || !academicYear) {
    throw ApiError.badRequest('course, semester, and academicYear are required');
  }
  const results = await generateResultsForClass({ course, semester, academicYear });
  res.json({ message: `Generated ${results.length} result(s)`, count: results.length });
});

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = {};
  if (req.query.course) filter.course = req.query.course;
  if (req.query.semester) filter.semester = req.query.semester;
  if (req.query.academicYear) filter.academicYear = req.query.academicYear;
  if (req.query.student) filter.student = req.query.student;

  if (req.user.role === 'student') {
    filter.student = req.studentProfile._id;
    filter.isPublished = true;
  } else if (req.user.role === 'teacher') {
    const studentIds = await getTeacherStudentIds(req.teacherProfile._id);
    filter.student = filter.student
      ? filter.student
      : { $in: studentIds };
  }

  const [items, total] = await Promise.all([
    Result.find(filter).populate(populateFields).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Result.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

const publish = asyncHandler(async (req, res) => {
  const { course, semester, academicYear } = req.body;
  if (!course || !semester || !academicYear) {
    throw ApiError.badRequest('course, semester, and academicYear are required');
  }

  const results = await Result.find({ course, semester, academicYear, isPublished: false });
  await Result.updateMany(
    { course, semester, academicYear },
    { isPublished: true, publishedAt: new Date() }
  );

  const populatedResults = await Result.find({ _id: { $in: results.map((r) => r._id) } }).populate({
    path: 'student',
    select: 'user',
  });

  const notifications = populatedResults.map((r) => ({
    user: r.student.user,
    title: 'Results Published',
    message: `Your semester ${semester} results have been published.`,
    link: '/student/results',
  }));
  if (notifications.length > 0) await Notification.insertMany(notifications);

  res.json({ message: `Published ${results.length} result(s)` });
});

const unpublish = asyncHandler(async (req, res) => {
  const { course, semester, academicYear } = req.body;
  if (!course || !semester || !academicYear) {
    throw ApiError.badRequest('course, semester, and academicYear are required');
  }
  const r = await Result.updateMany(
    { course, semester, academicYear },
    { isPublished: false, publishedAt: null }
  );
  res.json({ message: `Unpublished ${r.modifiedCount} result(s)` });
});

module.exports = { generate, list, publish, unpublish };
