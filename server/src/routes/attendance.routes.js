const express = require('express');
const controller = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/sheet', authorize('admin', 'teacher'), controller.getSheet);
router.put('/sheet', authorize('admin', 'teacher'), controller.saveSheet);
router.get('/summary', controller.summary);
router.get('/analytics', authorize('admin'), controller.analytics);

module.exports = router;
