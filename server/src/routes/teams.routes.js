const controller = require('../controllers/teams.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
