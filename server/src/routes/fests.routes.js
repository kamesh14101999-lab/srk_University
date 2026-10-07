const controller = require('../controllers/fests.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
