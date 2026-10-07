const express = require('express');
const controller = require('../controllers/clubs.controller');
const { standardRoutes } = require('../utils/routeFactory');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use('/', standardRoutes(controller));
router.get('/:id/members', protect, controller.listMembers);
router.post('/:id/members', protect, authorize('admin'), controller.addMember);
router.delete('/:id/members/:studentId', protect, authorize('admin'), controller.removeMember);

module.exports = router;
