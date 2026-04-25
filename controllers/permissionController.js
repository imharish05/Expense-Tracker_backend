const RolePermission = require("../models/RolePermission.js")


// Define all your system permissions in one place
const ALL_PERMISSIONS = [
    'view-admin', 'view-dashboard', 'change-status', 'view-staffs',
    'create-staff', 'edit-staff', 'delete-staff', 'view-customers',
    'create-customer', 'edit-customer', 'delete-customer', 'view-projects',
    'create-projects', 'edit-projects', 'delete-projects', 'upload-docs',
    'manage-permissions',  'manage-remainders', 'view-reports', 'manage-payment'
];

const getPermissions = async (req, res) => {
    try {
        const roles = await RolePermission.findAll();
        
        const basePermissions = { admin: ALL_PERMISSIONS, designer: [], customer: [], staff: [] };
        
        const permissionMap = roles.reduce((acc, curr) => {
            acc[curr.roleName] = curr.roleName === 'admin' ? ALL_PERMISSIONS : curr.permissions;
            return acc;
        }, basePermissions);

        res.status(200).json(permissionMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updatePermissions = async (req, res) => {
    const { permissions } = req.body; 

    try {
        const updatePromises = Object.keys(permissions).map(role => {
            let rolePerms = permissions[role];
            return RolePermission.upsert({
                roleName: role,
                permissions: rolePerms
            });
        });

        await Promise.all(updatePromises);
        res.status(200).json({ success: true, message: "Permissions updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {getPermissions,updatePermissions}