const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const fs = require('fs');
const path = require('path');

// models/Stage.js
const Stage = sequelize.define('Stage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    stage_Name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    paid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { 
        type: DataTypes.STRING, // Changed from ENUM to STRING for more flexibility with statuses like "Initialized"
        defaultValue: 'Pending' 
    },
    documentPath: { type: DataTypes.TEXT, allowNull: true },
    duration : { type: DataTypes.DATE, allowNull: true ,defaultValue: null},
    payment_mode: { type: DataTypes.STRING, allowNull: true },
    payment_date: { type: DataTypes.DATE, allowNull: true },
    payment_status: { type: DataTypes.STRING, allowNull: true },
    completion_notified: {
  type: DataTypes.BOOLEAN,
  defaultValue: false
},
    due_notified: {
  type: DataTypes.BOOLEAN,
  defaultValue: false
},

    projectId: { type: DataTypes.UUID, allowNull: false }
}, {
    hooks: {
        beforeDestroy: (stage) => {
            if (stage.documentPath) {
                const filePath = path.resolve(stage.documentPath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }
    }
});
module.exports = Stage;