const User = require('../models/User');
const RolePermission = require('../models/RolePermission');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- SIGN UP FUNCTION ---
const signup = async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    try {
        // 1. Validation: Check if user already exists
        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Phone number already registered" });
        }

        // 2. Fetch Permissions BEFORE creating the user
        // We look up the role provided in the request (defaulting to 'staff')
        const targetRole = role || 'staff';
        const roleData = await RolePermission.findOne({ 
            where: { roleName: targetRole } 
        });

        // 3. Security Check: Ensure the role actually exists in your permissions table
        if (!roleData && targetRole !== 'admin') {
            return res.status(400).json({ 
                success: false, 
                message: `The role '${targetRole}' does not exist. Please set up permissions for this role first.` 
            });
        }

        // 4. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create the New User (Does NOT include a permissions column)
        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: targetRole,
            status: 'Active'
        });

        // 6. Respond with the user and the permissions we fetched earlier
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                // These are the permissions we found in step 2
                permissions: roleData ? roleData.permissions : [] 
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// --- LOGIN FUNCTION ---
const login = async (req, res) => {
    const { phone, password } = req.body;

    try {
        // 1. Find user by PHONE
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 3. FETCH PERMISSIONS (This is the separate table lookup)
        const roleData = await RolePermission.findOne({ where: { roleName: user.role } });
        const activePermissions = roleData ? roleData.permissions : [];

        // 4. Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: activePermissions // Combined here for the frontend
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getMe = async (req, res) => {
    try {
        // 1. req.user.id comes from your 'protect' middleware
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Fetch permissions from the separate table based on the user's role
        const roleData = await RolePermission.findOne({ 
            where: { roleName: user.role } 
        });

        const activePermissions = roleData ? roleData.permissions : [];

        // 3. Return the user data + permissions
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: activePermissions
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { login, signup,getMe };