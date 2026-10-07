const { Fest } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(Fest, {
  searchFields: ['name', 'venue'],
  filterFields: ['year'],
});
