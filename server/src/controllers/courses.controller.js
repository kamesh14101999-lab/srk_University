const { Course, Subject, Student } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(Course, {
  populate: { path: 'department', select: 'name code' },
  searchFields: ['name', 'code'],
  filterFields: ['department', 'degreeType', 'isActive'],
  blockDeleteRefs: [
    { model: Subject, field: 'course', label: 'subject' },
    { model: Student, field: 'course', label: 'student' },
  ],
});
