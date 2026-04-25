const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const RolePermission = sequelize.define('RolePermission', {
    roleName: {
       type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    permissions: {
        // MUST be JSON. If it's STRING, change it now.
        type: DataTypes.JSON, 
        allowNull: false,
        defaultValue: []
    }
});

module.exports = RolePermission;