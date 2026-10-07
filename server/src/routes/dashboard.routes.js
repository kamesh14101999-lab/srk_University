const express = require('express');
const controller = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/admin', authorize('admin'), controller.admin);
router.get('/teacher', authorize('teacher'), controller.teacher);
router.get('/student', authorize('student'), controller.student);

module.exports = router;
