const { Achievement } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(Achievement, {
  populate: { path: 'student', select: 'user studentId', populate: { path: 'user', select: 'name' } },
  searchFields: ['title'],
  filterFields: ['student', 'category'],
});
