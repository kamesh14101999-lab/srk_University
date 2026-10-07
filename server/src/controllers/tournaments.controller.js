const { Tournament, Team, Fixture } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(Tournament, {
  populate: [
    { path: 'sport', select: 'name' },
    { path: 'winnerTeam', select: 'name' },
  ],
  searchFields: ['name', 'venue'],
  filterFields: ['sport', 'status'],
  blockDeleteRefs: [
    { model: Team, field: 'tournament', label: 'team' },
    { model: Fixture, field: 'tournament', label: 'fixture' },
  ],
});
