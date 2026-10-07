const controller = require('../controllers/departments.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
