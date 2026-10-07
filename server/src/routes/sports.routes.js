const controller = require('../controllers/sports.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
