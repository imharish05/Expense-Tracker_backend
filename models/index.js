const User = require('./User');
const Staff = require('./Staff');
const RolePermission = require('./RolePermission');
const Customer = require("./Customer");
const Project = require("./Project");
const Stage = require("./Stage");
const Payment = require("./Payment");
const sequelize = require('../config/db');
const fs = require('fs');
const path = require('path');

// --- HOOKS FOR FILE SYSTEM CLEANUP ---

/**
 * When a Stage is deleted (individually or via Project cascade), 
 * this hook removes the physical files from the 'uploads' folder.
 */
Stage.addHook('afterDestroy', async (stage, options) => {
    if (stage.documentPath) {
        // Handle multiple files if they are comma-separated
        const filePaths = stage.documentPath.split(',');
        
        filePaths.forEach(filePath => {
            // Resolve the path to ensure it works across different OS environments
            const resolvedPath = path.resolve(filePath.trim());
            
            if (fs.existsSync(resolvedPath)) {
                try {
                    fs.unlinkSync(resolvedPath);
                    console.log(`Successfully deleted file: ${resolvedPath}`);
                } catch (err) {
                    console.error(`Error deleting file ${resolvedPath}:`, err);
                }
            }
        });
    }
});

// --- RELATIONSHIPS ---

// 1. User & Staff
User.hasOne(Staff, { foreignKey: 'userId' });
Staff.belongsTo(User, { foreignKey: 'userId' });

// 2. Customer & Project 
// Deleting a customer deletes their projects, which triggers hooks: true cascade
Customer.hasMany(Project, { 
    foreignKey: 'customerId', 
    onDelete: 'CASCADE', 
    hooks: true 
});
Project.belongsTo(Customer, { foreignKey: 'customerId' });

// 3. Staff & Project
Staff.hasMany(Project, { foreignKey: 'assignedStaffId' });
Project.belongsTo(Staff, { foreignKey: 'assignedStaffId' });

// 4. Project & Stage
// hooks: true is CRITICAL here so that Stage hooks (file deletion) trigger 
// when the Project is deleted.
Project.hasMany(Stage, { 
    foreignKey: 'projectId', 
    onDelete: 'CASCADE', 
    hooks: true 
});
Stage.belongsTo(Project, { foreignKey: 'projectId' });

// 5. Project & Payment
Project.hasMany(Payment, { 
    foreignKey: 'projectId', 
    onDelete: 'CASCADE',
    hooks: true 
});
Payment.belongsTo(Project, { foreignKey: 'projectId' });

// 6. Stage & Payment
Stage.hasMany(Payment, { 
    foreignKey: 'stageId', 
    onDelete: 'CASCADE',
    hooks: true 
});
Payment.belongsTo(Stage, { foreignKey: 'stageId' });

module.exports = {
    User,
    Staff,
    RolePermission,
    Customer,
    Project,
    Stage,
    Payment,
    sequelize
};