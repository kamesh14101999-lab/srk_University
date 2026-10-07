const controller = require('../controllers/courses.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
