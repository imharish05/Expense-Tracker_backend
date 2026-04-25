const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    projectId: { 
        type: DataTypes.UUID, // Ensures it matches Project.id (UUID)
        allowNull: true,
        references: {
            model: 'Projects',
            key: 'id'
        }
    },
    stageId: { 
        type: DataTypes.UUID, // Ensures it matches Stage.id (UUID)
        allowNull: true,
        references: {
            model: 'Stages',
            key: 'id'
        }
    },
    customerId: { 
        type: DataTypes.UUID, 
        allowNull: true 
    },
    customerName: { type: DataTypes.STRING },
    projectName: { type: DataTypes.STRING },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    budget: { type: DataTypes.DECIMAL(15, 2) },
    stage_amount: { type: DataTypes.DECIMAL(15, 2) },
    payment_mode: { type: DataTypes.STRING },
    payment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    payment_status: { type: DataTypes.STRING }
});

module.exports = Payment;