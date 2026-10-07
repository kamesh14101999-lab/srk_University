const controller = require('../controllers/calendar.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
