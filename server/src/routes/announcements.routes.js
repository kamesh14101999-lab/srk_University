const express = require('express');
const controller = require('../controllers/announcements.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', controller.list);
router.post('/', authorize('admin', 'teacher'), controller.create);
router.patch('/:id', authorize('admin', 'teacher'), controller.update);
router.delete('/:id', authorize('admin', 'teacher'), controller.remove);

module.exports = router;
