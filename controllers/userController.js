const User = require('../models/user');
const Role = require('../models/role');

// Simple in-memory cache with TTL (Time To Live)
const cache = new Map();
const CACHE_TTL_MILLISECONDS = 5 * 60 * 1000; // 5 minutes

/**
 * Creates a new user. (Admin only)
 * Expects name, email, password, and roleName in the request body.
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;

    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password, roleName.' });
    }

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' }); // 409 Conflict
    }

    // Find the role by name to get its ID
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ message: `Invalid roleName: '${roleName}'. Valid roles are 'admin' or 'reader'.` });
    }

    // Create the new user (password will be hashed by the model's beforeCreate hook)
    const newUser = await User.create({
      name,
      email,
      password,
      role_id: role.id,
    });

    // Invalidate 'allUsers' cache as the list has changed
    cache.delete('allUsers');
    // console.log("Cache for 'allUsers' invalidated due to new user creation.");

    // Prepare response (excluding password)
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role_id: newUser.role_id, // Or fetch and return role.name if preferred
      created_on: newUser.created_on,
      updated_on: newUser.updated_on,
    };

    res.status(201).json({ message: 'User created successfully.', user: userResponse });
  } catch (error) {
    console.error("Create user error:", error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Validation Error", errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'An error occurred while creating the user.', error: error.message });
  }
};

/**
 * Retrieves a specific user by their ID. (Admin only)
 * Implements caching.
 */
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const cacheKey = `user_${userId}`;

    // Check cache first
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && cachedEntry.timestamp > Date.now() - CACHE_TTL_MILLISECONDS) {
      // console.log(`Cache HIT for user ID: ${userId}`);
      return res.status(200).json(cachedEntry.data);
    }
    // console.log(`Cache MISS for user ID: ${userId}`);

    // Fetch user from database, excluding password, and including role name
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'role_id'] }, // Exclude password and role_id (role name is included via association)
      include: {
        model: Role,
        as: 'role',
        attributes: ['name'], // Only include the name of the role
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Structure the response data
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ? user.role.name : null, // Safely access role name
      created_on: user.created_on,
      updated_on: user.updated_on,
    };

    // Store in cache
    cache.set(cacheKey, { data: userData, timestamp: Date.now() });

    res.status(200).json(userData);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: 'An error occurred while fetching the user.', error: error.message });
  }
};

/**
 * Retrieves a list of all users. (Admin only)
 * Implements caching.
 */
const listUsers = async (req, res) => {
  try {
    const cacheKey = 'allUsers';

    // Check cache first
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && cachedEntry.timestamp > Date.now() - CACHE_TTL_MILLISECONDS) {
      // console.log("Cache HIT for 'allUsers'");
      return res.status(200).json(cachedEntry.data);
    }
    // console.log("Cache MISS for 'allUsers'");

    // Fetch all users from database, excluding passwords, and including role names
    const users = await User.findAll({
      attributes: { exclude: ['password', 'role_id'] },
      include: {
        model: Role,
        as: 'role',
        attributes: ['name'],
      },
      order: [['created_on', 'DESC']] // Example: order by creation date
    });

    // Structure the response data
    const usersData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ? user.role.name : null,
      created_on: user.created_on,
      updated_on: user.updated_on,
    }));

    // Store in cache
    cache.set(cacheKey, { data: usersData, timestamp: Date.now() });

    res.status(200).json(usersData);
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ message: 'An error occurred while fetching users.', error: error.message });
  }
};

module.exports = { createUser, getUserById, listUsers };
