const express = require('express');
const controller = require('../controllers/marks.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin', 'teacher'));

router.get('/sheet', controller.getSheet);
router.put('/sheet', controller.saveSheet);

module.exports = router;
