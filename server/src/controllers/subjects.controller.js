const { Subject, Exam, TeachingAssignment } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(Subject, {
  populate: { path: 'course', select: 'name code' },
  searchFields: ['name', 'code'],
  filterFields: ['course', 'semester', 'type'],
  blockDeleteRefs: [
    { model: Exam, field: 'subject', label: 'exam' },
    { model: TeachingAssignment, field: 'subject', label: 'teaching assignment' },
  ],
});
