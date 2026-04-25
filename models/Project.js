const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    projectName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
    },
    customerId: {
        type: DataTypes.UUID, // Matches Customer.id (STRING)
        allowNull: false,
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    customerName: {
        type: DataTypes.STRING,
    },
    assignedStaffId: {
        type: DataTypes.UUID, // Matches Staff.id (STRING)
        references: {
            model: 'staffs',
            key: 'id'
        }
    },
    assignedStaffName: {
        type: DataTypes.STRING,
    },
    cost: {
        type: DataTypes.STRING,
    },
    projectType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Initialized'
    }
}, {
    timestamps: true
});

module.exports = Project;