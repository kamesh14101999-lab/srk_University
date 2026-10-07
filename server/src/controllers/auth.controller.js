const { User, Student, Teacher } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../services/token');
const serializeUser = require('../utils/serializeUser');

async function resolveUserId(identifier, role) {
  if (identifier.includes('@')) {
    const user = await User.findOne({ email: identifier.toLowerCase(), role }).select('+password');
    return user;
  }

  if (role === 'student') {
    const student = await Student.findOne({ studentId: identifier });
    if (!student) return null;
    return User.findOne({ _id: student.user, role }).select('+password');
  }

  if (role === 'teacher') {
    const teacher = await Teacher.findOne({ employeeId: identifier });
    if (!teacher) return null;
    return User.findOne({ _id: teacher.user, role }).select('+password');
  }

  return null;
}

const login = asyncHandler(async (req, res) => {
  const { identifier, password, role } = req.body;
  if (!identifier || !password || !role) {
    throw ApiError.badRequest('identifier, password, and role are required');
  }
  if (!['admin', 'teacher', 'student'].includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }

  const user = await resolveUserId(identifier, role);
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  if (!user.isActive) throw ApiError.unauthorized('Account is deactivated');

  const match = await user.comparePassword(password);
  if (!match) throw ApiError.unauthorized('Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  const serialized = await serializeUser(user);
  res.json({ token, user: serialized });
});

const me = asyncHandler(async (req, res) => {
  const serialized = await serializeUser(req.user);
  res.json(serialized);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('currentPassword and newPassword are required');
  }
  if (newPassword.length < 8) {
    throw ApiError.badRequest('newPassword must be at least 8 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  const match = await user.comparePassword(currentPassword);
  if (!match) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});

module.exports = { login, me, changePassword };
