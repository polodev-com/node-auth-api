const express = require('express');
const router = express.Router();
const { createUser, getUserById, listUsers } = require('../controllers/userController');
const { verifyToken, isRole } = require('../middleware/authMiddleware');

// All routes in this file require a valid token (verifyToken)

// POST /api/users - Create a new user
// Protected: Requires authentication (valid token) and 'admin' role.
router.post('/', verifyToken, isRole('admin'), createUser);

// GET /api/users - List all users
// Protected: Requires authentication and 'admin' role.
router.get('/', verifyToken, isRole('admin'), listUsers);

// GET /api/users/:id - Get a specific user by their ID
// Protected: Requires authentication and 'admin' role.
router.get('/:id', verifyToken, isRole('admin'), getUserById);

module.exports = router;
