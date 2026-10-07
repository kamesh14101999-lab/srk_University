const controller = require('../controllers/clusters.controller');
const { standardRoutes } = require('../utils/routeFactory');

module.exports = standardRoutes(controller);
