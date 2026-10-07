const { Teacher, Student } = require('../models');

async function serializeUser(user) {
  const base = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
  };

  if (user.role === 'teacher') {
    const profile = await Teacher.findOne({ user: user._id }).populate('department', 'name code');
    return { ...base, profile };
  }

  if (user.role === 'student') {
    const profile = await Student.findOne({ user: user._id })
      .populate('department', 'name code')
      .populate('course', 'name code');
    return { ...base, profile };
  }

  return base;
}

module.exports = serializeUser;
