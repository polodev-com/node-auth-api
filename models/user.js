const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs'); // For password hashing
const Role = require('./role');     // Import Role model for association

const User = sequelize.define('User', {
  // Column: id
  // Data type: INTEGER (SERIAL in PostgreSQL)
  // Description: Primary key for the user
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Column: name
  // Data type: STRING (VARCHAR in PostgreSQL)
  // Description: Name of the user
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Column: email
  // Data type: STRING (VARCHAR in PostgreSQL)
  // Description: Email of the user, must be unique
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Validates if the string is an email
    },
  },
  // Column: role_id
  // Data type: INTEGER
  // Description: Foreign key referencing the id in the 'roles' table
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Role, // This is a reference to another model
      key: 'id',   // This is the column name of the referenced model
    },
  },
  // Column: password
  // Data type: STRING
  // Description: Hashed password of the user
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Column: created_on
  // Data type: DATE
  // Description: Timestamp of user creation
  created_on: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Sets default value to current time
    // field: 'created_on' // Explicitly map field name if it differs from Sequelize's camelCase
  },
  // Column: updated_on
  // Data type: DATE
  // Description: Timestamp of last user update
  updated_on: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    // field: 'updated_on' // Explicitly map field name
  },
}, {
  tableName: 'users', // Explicitly set the table name
  timestamps: true,   // Enable Sequelize's automatic timestamp management
  createdAt: 'created_on', // Map Sequelize's `createdAt` to `created_on` column
  updatedAt: 'updated_on', // Map Sequelize's `updatedAt` to `updated_on` column
  hooks: {
    // Hook executed before a new user record is created
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Hook executed before an existing user record is updated
    beforeUpdate: async (user) => {
      // Only hash password if it has been changed
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Define Associations
// A User belongs to one Role
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' }); // 'as: role' allows eager loading user.role
// A Role can have many Users
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' }); // 'as: users' allows eager loading role.users

// Instance method to compare provided password with the stored hashed password
User.prototype.isValidPassword = async function(passwordToVerify) {
  return await bcrypt.compare(passwordToVerify, this.password);
};

module.exports = User;
