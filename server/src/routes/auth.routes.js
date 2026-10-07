const express = require('express');
const { login, me, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, me);
router.patch('/password', protect, changePassword);

module.exports = router;
