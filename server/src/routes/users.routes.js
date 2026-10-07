const express = require('express');
const controller = require('../controllers/users.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/', controller.list);
router.patch('/:id/status', controller.setStatus);
router.patch('/:id/reset-password', controller.resetPassword);

module.exports = router;
