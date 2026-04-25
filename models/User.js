const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js'); // Adjust path to your db config

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'staff',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active',
  }
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;