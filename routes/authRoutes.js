const express = require('express');
const router = express.Router();
const { login, logout, validateToken } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware'); // Needed for logout to blacklist the token

// POST /api/auth/login - User login
router.post('/login', login);

// POST /api/auth/logout - User logout
// verifyToken middleware is used here to get the token from the request
// so it can be added to the blacklist by the logout controller.
router.post('/logout', verifyToken, logout);

// GET /api/auth/validateToken - Validate JWT token for external services
router.get('/validateToken', validateToken);

module.exports = router;
