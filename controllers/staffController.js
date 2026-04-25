const { User, Staff, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// 1. Create Staff + User Account
const addStaff = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, email, phone, password, role, location, status } = req.body;

        const existing = await User.findOne({ where: { phone } });
        if (existing) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Phone number already exists" });
        }

        const hashedPassword = await bcrypt.hash(password || '123456', 10);
        
        // 1. Create User Account
        const user = await User.create({
            name, email, phone,
            password: hashedPassword,
            role: role || 'staff',
            status: status || 'Active'
        }, { transaction: t });

        // 2. Create Staff Profile (Mapping location to designation or adding it to model)
        const staff = await Staff.create({
            userId: user.id,
            name, email, phone,
            role, // Using role as designation
            location, // Using location as department
            projects: [],
            plainPassword: password
        }, { transaction: t });

        await t.commit();

        res.status(201).json({ success: true, staff });
} catch (error) {
    await t.rollback();
    
    // Log to terminal for you to see
    console.log("Validation Error Details:", error.errors?.map(e => e.message));

    // Send the specific error back to the frontend
    const message = error.errors ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message: message });
}
};

// 2. Toggle Project Assignment in DB
const toggleProjectAssignment = async (req, res) => {
    try {
        const { staffId, projectId, isAssigning } = req.body;
        
        const project = await Project.findByPk(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Update the Project record to link/unlink the staff
        await project.update({
            assignedStaffId: isAssigning ? staffId : null,
            // You might need to fetch staff name here if it's not in the payload
            status: isAssigning ? 'Assigned' : 'Initialized'
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getAllStaffs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Staff.findAndCountAll({
            include: [{
                model: User,
                attributes: ['password', 'role', 'status']
            }],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const formattedStaffs = rows.map(staff => {
            const data = staff.toJSON();
            return {
                ...data,
                password: data.User?.password || "N/A",
                role: data.role || data.User?.role,
                status: data.status || data.User?.status
            };
        });

        res.status(200).json({ 
            success: true, 
            staffs: formattedStaffs,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateStaff = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, email, phone, location, role, password, status } = req.body;
        const staff = await Staff.findByPk(req.params.id);
        
        if (!staff) return res.status(404).json({ message: "Staff not found" });

        // 1. Update Staff Table
        await staff.update({ name, email, phone, location, role, status }, { transaction: t });

        // 2. Update User Table (Include Password if changed)
        const userUpdateData = { name, email, role, status };
        if (password) {
            const bcrypt = require('bcryptjs');
            userUpdateData.password = await bcrypt.hash(password, 10);
            // If you are using plainPassword for the list view:
            await staff.update({ plainPassword: password }, { transaction: t });
        }
        
        await User.update(userUpdateData, { 
            where: { id: staff.userId }, 
            transaction: t 
        });

        await t.commit();

        // 3. Re-fetch the updated staff with the User association
        const updatedStaff = await Staff.findByPk(req.params.id, {
            include: [{ model: User, attributes: ['password', 'role', 'status'] }]
        });

        // Flatten the data for the frontend
        const result = {
            ...updatedStaff.toJSON(),
            password: updatedStaff.User?.password,
            role: updatedStaff.role || updatedStaff.User?.role
        };

        res.status(200).json({ success: true, staff: result });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};
const deleteStaff = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const staff = await Staff.findByPk(req.params.id);
        if (staff) await User.destroy({ where: { id: staff.userId }, transaction: t });
        if (staff) await staff.destroy({ transaction: t });
        await t.commit();
        res.status(200).json({ success: true });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addStaff, getAllStaffs, updateStaff, deleteStaff, toggleProjectAssignment };