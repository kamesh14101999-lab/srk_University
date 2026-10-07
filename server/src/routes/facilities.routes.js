const controller = require('../controllers/facilities.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
