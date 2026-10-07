const { Facility } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(Facility, {
  searchFields: ['name'],
  filterFields: ['category'],
});
