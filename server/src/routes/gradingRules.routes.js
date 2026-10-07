const express = require('express');
const controller = require('../controllers/gradingRules.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', controller.list);
router.put('/', authorize('admin'), controller.replaceAll);

module.exports = router;
