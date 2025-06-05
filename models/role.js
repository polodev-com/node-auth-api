const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  // Column: id
  // Data type: INTEGER (SERIAL in PostgreSQL)
  // Description: Primary key for the role
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Column: name
  // Data type: ENUM('admin', 'reader')
  // Description: Name of the role, restricted to 'admin' or 'reader'
  name: {
    type: DataTypes.ENUM('admin', 'reader'),
    allowNull: false,
    unique: true, // Ensures role names are unique
  },
  // Column: permission
  // Data type: JSONB
  // Description: Stores permissions for the role (flexible structure)
  permission: {
    type: DataTypes.JSONB,
    defaultValue: {}, // Defaults to an empty JSON object
  },
}, {
  tableName: 'roles', // Explicitly set the table name
  timestamps: false,  // Disable Sequelize's default createdAt and updatedAt columns as they are not in the schema
});

module.exports = Role;
