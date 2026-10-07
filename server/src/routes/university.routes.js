const express = require('express');
const controller = require('../controllers/university.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', controller.get);
router.put('/', authorize('admin'), controller.update);

module.exports = router;
