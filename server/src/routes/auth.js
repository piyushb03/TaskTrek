const express = require('express');
const router = express.Router();
const { signup, login, getMe, listUsers } = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.get('/users', authenticateToken, requireAdmin, listUsers);

module.exports = router;
