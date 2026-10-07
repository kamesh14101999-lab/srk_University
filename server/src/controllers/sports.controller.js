const { Sport, Tournament, Team } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(Sport, {
  searchFields: ['name'],
  blockDeleteRefs: [
    { model: Tournament, field: 'sport', label: 'tournament' },
    { model: Team, field: 'sport', label: 'team' },
  ],
});
