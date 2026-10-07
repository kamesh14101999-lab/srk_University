const controller = require('../controllers/academicYears.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
