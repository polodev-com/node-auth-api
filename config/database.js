const { Sequelize } = require('sequelize');
require('dotenv').config(); // Loads environment variables from .env file

// Create a new Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432, // Use DB_PORT from .env or default to 5432
    dialect: process.env.DB_DIALECT || 'postgres', // Default to postgres
    logging: false, // Disable logging of SQL queries; set to console.log for debugging
    pool: { // Optional: configure connection pooling
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
