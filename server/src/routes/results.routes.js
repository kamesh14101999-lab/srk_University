const express = require('express');
const controller = require('../controllers/results.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.post('/generate', authorize('admin'), controller.generate);
router.get('/', controller.list);
router.patch('/publish', authorize('admin'), controller.publish);
router.patch('/unpublish', authorize('admin'), controller.unpublish);

module.exports = router;
