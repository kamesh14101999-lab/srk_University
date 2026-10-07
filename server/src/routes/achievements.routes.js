const controller = require('../controllers/achievements.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
