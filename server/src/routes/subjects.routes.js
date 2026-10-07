const controller = require('../controllers/subjects.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
