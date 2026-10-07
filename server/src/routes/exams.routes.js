const express = require('express');
const controller = require('../controllers/exams.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', authorize('admin'), controller.create);
router.patch('/:id', authorize('admin'), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);
router.patch('/:id/publish', authorize('admin'), controller.publish);
router.patch('/:id/unpublish', authorize('admin'), controller.unpublish);

module.exports = router;
