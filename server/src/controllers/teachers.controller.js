const { Teacher, User, TeachingAssignment, TimetableEntry } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, getSort } = require('../utils/crudFactory');
const generateTempPassword = require('../utils/generatePassword');

const populateFields = [
  { path: 'user', select: 'name email isActive lastLoginAt' },
  { path: 'department', select: 'name code' },
];

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.designation) filter.designation = req.query.designation;
  if (req.query.status) filter.status = req.query.status;

  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    const matchingUsers = await User.find({ name: regex, role: 'teacher' }).select('_id');
    filter.$or = [{ employeeId: regex }, { user: { $in: matchingUsers.map((u) => u._id) } }];
  }

  const [items, total] = await Promise.all([
    Teacher.find(filter).populate(populateFields).sort(getSort(req)).skip(skip).limit(limit),
    Teacher.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

const getOne = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate(populateFields);
  if (!teacher) throw ApiError.notFound('Teacher not found');

  if (req.user.role === 'teacher' && teacher.user._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not allowed');
  }

  res.json(teacher);
});

const create = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    employeeId,
    photoUrl,
    phone,
    department,
    designation,
    qualification,
    specialization,
    experienceYears,
    joiningDate,
    status,
  } = req.body;

  if (!name || !email || !employeeId || !department || !designation) {
    throw ApiError.badRequest('name, email, employeeId, department, and designation are required');
  }

  const { seedDefaultPassword } = require('../config/env');
  const user = await User.create({
    name,
    email,
    password: password || seedDefaultPassword,
    role: 'teacher',
  });

  try {
    const teacher = await Teacher.create({
      user: user._id,
      employeeId,
      photoUrl,
      phone,
      department,
      designation,
      qualification,
      specialization,
      experienceYears,
      joiningDate,
      status,
    });
    const populated = await teacher.populate(populateFields);
    res.status(201).json(populated);
  } catch (err) {
    await user.deleteOne();
    throw err;
  }
});

const update = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw ApiError.notFound('Teacher not found');

  const { name, email, ...teacherFields } = req.body;
  if (name || email) {
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    await User.findByIdAndUpdate(teacher.user, userUpdate);
  }

  Object.assign(teacher, teacherFields);
  await teacher.save();
  const populated = await teacher.populate(populateFields);
  res.json(populated);
});

const remove = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw ApiError.notFound('Teacher not found');

  const assignmentCount = await TeachingAssignment.countDocuments({ teacher: teacher._id });
  if (assignmentCount > 0) {
    throw ApiError.conflict(
      `Cannot delete: ${assignmentCount} teaching assignment(s) still reference this teacher`
    );
  }

  await teacher.deleteOne();
  await User.findByIdAndDelete(teacher.user);
  res.json({ message: 'Deleted' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw ApiError.notFound('Teacher not found');

  const { newPassword } = req.body;
  if (newPassword && newPassword.length < 8) {
    throw ApiError.badRequest('newPassword must be at least 8 characters');
  }

  const user = await User.findById(teacher.user);
  if (!user) throw ApiError.notFound('Linked user account not found');

  const password = newPassword || generateTempPassword();
  user.password = password;
  await user.save();

  res.json({ message: 'Password reset', temporaryPassword: password });
});

const workload = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw ApiError.notFound('Teacher not found');

  const assignments = await TeachingAssignment.find({ teacher: teacher._id })
    .populate('subject', 'name code credits type')
    .populate('course', 'name code')
    .populate('academicYear', 'label');

  const assignmentIds = assignments.map((a) => a._id);
  const timetableEntries = await TimetableEntry.find({ assignment: { $in: assignmentIds } });

  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const weeklyMinutes = timetableEntries.reduce(
    (sum, e) => sum + (toMinutes(e.endTime) - toMinutes(e.startTime)),
    0
  );

  res.json({
    assignments,
    timetableEntries,
    weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
  });
});

module.exports = { list, getOne, create, update, remove, resetPassword, workload };
