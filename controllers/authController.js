const User = require('../models/user');
const Role = require('../models/role'); // Needed for eager loading role
const jwt = require('jsonwebtoken');
const { tokenBlacklist } = require('../middleware/authMiddleware'); // For blacklisting tokens on logout
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Handles user login.
 * Validates credentials, and if successful, returns a JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email and include their role
    const user = await User.findOne({
      where: { email },
      include: {
        model: Role,
        as: 'role', // Eager load the associated role
        attributes: ['name'] // Only fetch the role name
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    // Validate password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // Prepare JWT payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.name, // Include user's role name in the token
    };

    // Sign the JWT
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { // Return some user details (excluding password)
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'An error occurred during the login process.', error: error.message });
  }
};

/**
 * Handles user logout.
 * Adds the current token to a blacklist.
 */
const logout = (req, res) => {
  const token = req.token; // Token is attached by verifyToken middleware

  if (token) {
    tokenBlacklist.add(token);
    // console.log(`Token added to blacklist. Blacklist size: ${tokenBlacklist.size}`);
  }
  res.status(200).json({ message: 'Logout successful. Token has been invalidated.' });
};

/**
 * Validates a JWT token for external services.
 * Returns decoded user info if valid, or 401 if invalid/expired/blacklisted.
 */
const validateToken = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ message: 'No token provided or token is not Bearer type.' });
  }
  const token = authHeader.split(' ')[1];
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token is blacklisted.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, message: error.message });
  }
};

module.exports = { login, logout };
module.exports.validateToken = validateToken;
