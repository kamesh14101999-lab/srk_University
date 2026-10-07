const { Department, Course, Student, Teacher } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(Department, {
  populate: { path: 'hod', select: 'user employeeId', populate: { path: 'user', select: 'name' } },
  searchFields: ['name', 'code'],
  blockDeleteRefs: [
    { model: Course, field: 'department', label: 'course' },
    { model: Student, field: 'department', label: 'student' },
    { model: Teacher, field: 'department', label: 'teacher' },
  ],
});
