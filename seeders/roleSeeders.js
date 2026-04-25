const RolePermission = require("../models/RolePermission");

const seedRoles = async () => {
  await RolePermission.bulkCreate([
    { roleName: 'admin', permissions: [] },
    { roleName: 'designer', permissions: [] },
    { roleName: 'customer', permissions: [] },
    { roleName: 'staff', permissions: [] }
  ], { ignoreDuplicates: true });
};

module.exports = seedRoles;