const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role'); // Required for eager loading role
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// In-memory store for blacklisted tokens (for logout functionality)
const tokenBlacklist = new Set();

/**
 * Middleware to verify JWT token from Authorization header.
 * If valid, attaches user object (with role) and token to request.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied. No token provided or token is not Bearer type.' });
  }

  const token = authHeader.split(' ')[1];

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token is invalid.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user and their role from database
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Role,
        as: 'role', // Eager load the associated role
        attributes: ['name', 'id'] // Specify which role attributes to include
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.user = user;   // Attach the full user object (including role) to the request
    req.token = token; // Attach the token itself for potential use (e.g., logout blacklisting)
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    console.error("Token verification error:", error);
    return res.status(500).json({ message: 'Failed to authenticate token.' });
  }
};

/**
 * Middleware factory to check if the authenticated user has a specific role.
 * @param {string} requiredRoleName - The name of the role required (e.g., 'admin', 'reader').
 */
const isRole = (requiredRoleName) => {
  return (req, res, next) => {
    // Ensure user object and role are attached by verifyToken middleware
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden. User role information is missing.' });
    }

    if (req.user.role.name !== requiredRoleName) {
      return res.status(403).json({
        message: `Forbidden. Access requires '${requiredRoleName}' role. Your role is '${req.user.role.name}'.`
      });
    }
    next(); // User has the required role, proceed
  };
};

module.exports = { verifyToken, isRole, tokenBlacklist };
