const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const router = express.Router();
router.post('/login', ctrl.login);
router.post('/register', ctrl.register);
router.get('/me', protect, ctrl.me);

module.exports = router;
