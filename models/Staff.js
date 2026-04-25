const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Staff = sequelize.define('Staff', {
    id: { 
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    location: DataTypes.STRING, 
    role: DataTypes.STRING, 
    plainPassword: { type: DataTypes.STRING },
    projects: {
        type: DataTypes.JSON, 
        defaultValue: []
    }
}, {
    tableName: 'staffs',
    timestamps: true
});

module.exports = Staff;