const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { User, Teacher, Student } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized('No token provided');

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(payload.id);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (!user.isActive) throw ApiError.unauthorized('Account is deactivated');

  req.user = user;

  if (user.role === 'teacher') {
    req.teacherProfile = await Teacher.findOne({ user: user._id });
  } else if (user.role === 'student') {
    req.studentProfile = await Student.findOne({ user: user._id });
  }

  next();
});

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have access to this resource'));
    }
    next();
  };
}

module.exports = { protect, authorize };
