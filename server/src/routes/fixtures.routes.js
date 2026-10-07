const controller = require('../controllers/fixtures.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
