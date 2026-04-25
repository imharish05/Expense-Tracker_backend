const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Customer = sequelize.define('Customer', {
    id: { 
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    address: { 
        type: DataTypes.STRING 
    },
    phone: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true 
    },
    budget: { 
        type: DataTypes.STRING 
    },
    status: { 
        type: DataTypes.STRING, 
        defaultValue: 'active' 
    }
}, {
    tableName: 'customers',
    timestamps: true
});

module.exports = Customer;