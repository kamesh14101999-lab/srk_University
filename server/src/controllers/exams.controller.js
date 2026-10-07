const { Exam, Mark, TeachingAssignment } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination } = require('../utils/crudFactory');

const populateFields = [
  { path: 'subject', select: 'name code semester' },
  { path: 'course', select: 'name code' },
  { path: 'academicYear', select: 'label' },
];

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.course) filter.course = req.query.course;
  if (req.query.semester) filter.semester = req.query.semester;
  if (req.query.academicYear) filter.academicYear = req.query.academicYear;
  if (req.query.upcoming === 'true') filter.date = { $gte: new Date() };

  if (req.user.role === 'teacher') {
    const assignments = await TeachingAssignment.find({ teacher: req.teacherProfile._id });
    filter.subject = { $in: assignments.map((a) => a.subject) };
  } else if (req.user.role === 'student') {
    const sp = req.studentProfile;
    filter.course = sp.course;
    filter.semester = sp.semester;
  }

  const [items, total] = await Promise.all([
    Exam.find(filter).populate(populateFields).sort({ date: -1 }).skip(skip).limit(limit),
    Exam.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

const getOne = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id).populate(populateFields);
  if (!exam) throw ApiError.notFound('Exam not found');
  res.json(exam);
});

const create = asyncHandler(async (req, res) => {
  const exam = await Exam.create(req.body);
  res.status(201).json(exam);
});

const update = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw ApiError.notFound('Exam not found');
  if (exam.isPublished) throw ApiError.forbidden('Cannot edit a published exam');
  Object.assign(exam, req.body);
  await exam.save();
  res.json(exam);
});

const remove = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw ApiError.notFound('Exam not found');
  const markCount = await Mark.countDocuments({ exam: exam._id });
  if (markCount > 0) throw ApiError.conflict(`Cannot delete: ${markCount} mark record(s) exist`);
  await exam.deleteOne();
  res.json({ message: 'Deleted' });
});

const publish = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, { isPublished: true }, { new: true });
  if (!exam) throw ApiError.notFound('Exam not found');
  res.json(exam);
});

const unpublish = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, { isPublished: false }, { new: true });
  if (!exam) throw ApiError.notFound('Exam not found');
  res.json(exam);
});

module.exports = { list, getOne, create, update, remove, publish, unpublish };
