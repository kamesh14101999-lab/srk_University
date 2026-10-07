const { Team, Fixture } = require('../models');
const { crudFactory } = require('../utils/crudFactory');

module.exports = crudFactory(Team, {
  populate: [
    { path: 'sport', select: 'name' },
    { path: 'tournament', select: 'name' },
    { path: 'department', select: 'name code' },
    { path: 'captain', select: 'studentId user', populate: { path: 'user', select: 'name' } },
    { path: 'coach', select: 'user', populate: { path: 'user', select: 'name' } },
  ],
  searchFields: ['name'],
  filterFields: ['sport', 'tournament', 'department'],
  blockDeleteRefs: [
    { model: Fixture, field: 'teamA', label: 'fixture' },
    { model: Fixture, field: 'teamB', label: 'fixture' },
  ],
});
