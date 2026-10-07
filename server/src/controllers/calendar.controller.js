const { CalendarEntry } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(CalendarEntry, {
  searchFields: ['title'],
  filterFields: ['type'],
});
