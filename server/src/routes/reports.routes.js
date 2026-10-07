const express = require('express');
const controller = require('../controllers/reports.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/:type', controller.generate);

module.exports = router;
