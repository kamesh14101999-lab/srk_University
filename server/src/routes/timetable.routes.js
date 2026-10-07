const express = require('express');
const controller = require('../controllers/timetable.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/me', authorize('teacher', 'student'), controller.me);
router.get('/', authorize('admin', 'teacher'), controller.list);
router.post('/', authorize('admin'), controller.create);
router.patch('/:id', authorize('admin'), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;
