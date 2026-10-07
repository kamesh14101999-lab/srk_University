const { Fixture } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(Fixture, {
  populate: [
    { path: 'tournament', select: 'name' },
    { path: 'teamA', select: 'name' },
    { path: 'teamB', select: 'name' },
    { path: 'winner', select: 'name' },
  ],
  filterFields: ['tournament', 'status'],
});
