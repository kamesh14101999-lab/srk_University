const controller = require('../controllers/tournaments.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
