const express = require('express');
const controller = require('../controllers/students.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', authorize('admin', 'teacher'), controller.list);
router.get('/:id', controller.getOne);
router.post('/', authorize('admin'), controller.create);
router.patch('/:id', authorize('admin'), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);
router.post('/:id/reset-password', authorize('admin'), controller.resetPassword);
router.post('/:id/remarks', authorize('teacher'), controller.addRemark);
router.get('/:id/attendance', controller.getAttendance);
router.get('/:id/marks', controller.getMarks);
router.get('/:id/results', controller.getResults);
router.get('/:id/activities', controller.getActivities);

module.exports = router;
