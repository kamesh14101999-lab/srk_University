const express = require('express');
const controller = require('../controllers/events.controller');
const { standardRoutes } = require('../utils/routeFactory');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use('/', standardRoutes(controller));
router.post('/:id/register', protect, authorize('student'), controller.register);

module.exports = router;
