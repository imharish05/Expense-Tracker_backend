const express = require('express');
const router = express.Router();
const { login, signup, getMe } = require('../controllers/authControllers.js');
const { protect } = require('../middleware/protect.js');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;