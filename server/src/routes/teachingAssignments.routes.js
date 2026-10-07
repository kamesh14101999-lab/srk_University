const controller = require('../controllers/teachingAssignments.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
