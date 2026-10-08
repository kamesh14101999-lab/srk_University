const express = require('express');
const controller = require('../controllers/teachers.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', authorize('admin'), controller.list);
router.get('/:id/workload', authorize('admin'), controller.workload);
router.get('/:id', controller.getOne);
router.post('/', authorize('admin'), controller.create);
router.patch('/:id', authorize('admin'), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);
router.post('/:id/reset-password', authorize('admin'), controller.resetPassword);

module.exports = router;
