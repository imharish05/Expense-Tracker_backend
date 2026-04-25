// ADD PROJECT
const Project = require('../models/Project');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const Stage = require('../models/Stage');
const Payment = require('../models/Payment');
const fs = require('fs');
const path = require('path');

// projectController.js -> createProject
exports.createProject = async (req, res) => {
    try {
        // 1. Create the project
        const project = await Project.create(req.body);

        // 2. If a staff member is assigned, update their projects list
        if (req.body.assignedStaffId) {
            const staff = await Staff.findByPk(req.body.assignedStaffId);
            
            if (staff) {
                // Ensure we are working with an array
                let currentProjects = [];
                
                if (Array.isArray(staff.projects)) {
                    currentProjects = [...staff.projects];
                } else if (typeof staff.projects === 'string') {
                    try {
                        currentProjects = JSON.parse(staff.projects);
                    } catch (e) {
                        currentProjects = [];
                    }
                }

                // Add the new project ID if it doesn't exist
                if (!currentProjects.includes(project.id)) {
                    currentProjects.push(project.id);
                }

                // Use the update method and ensure it's saved
                // If using a JSON column in MySQL, Sequelize handles the stringify
                await staff.update({ projects: currentProjects });
            }
        }

        // 3. Return the full project with associations for the UI
        const fullProject = await Project.findByPk(project.id, {
            include: [
                { model: Customer, attributes: ['name', 'phone', 'address'] },
                { model: Staff, attributes: ['name', 'email', 'role'] }
            ]
        });

        console.log(fullProject , "This is the full project");
        

        res.status(201).json({ success: true, project: fullProject });
    } catch (error) {
        console.error("Create Project Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Project.findAndCountAll({
            distinct: true, // Prevents count errors when using includes
            include: [
                { model: Customer, attributes: ['name','id'] },
                { model: Staff, attributes: ['name', 'role','id'] }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ 
            success: true, 
            projects: rows,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// UPDATE PROJECT
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params; // The specific Project ID being updated
        const { assignedStaffId: newStaffId } = req.body;

        // 1. Get current project state to identify the OLD staff
        const oldProject = await Project.findByPk(id);
        if (!oldProject) return res.status(404).json({ success: false, message: "Project not found" });

        const oldStaffId = oldProject.assignedStaffId;

        // 2. Update the Project itself
        await Project.update(req.body, { where: { id } });

        // 3. Only run reassignment logic if the staff member actually changed
        if (String(newStaffId) !== String(oldStaffId)) {
            
            // --- STEP A: REMOVE ID FROM OLD STAFF ---
            if (oldStaffId) {
                const oldStaff = await Staff.findByPk(oldStaffId);
                if (oldStaff) {
                    let projects = oldStaff.projects;
                    // If it's a string (e.g. from MySQL TEXT column), parse it
                    if (typeof projects === 'string') projects = JSON.parse(projects);
                    
                    // Filter: Keep everything EXCEPT the current project ID
                    const updatedProjects = projects.filter(pId => String(pId) !== String(id));
                    
                    await oldStaff.update({ projects: updatedProjects });
                }
            }

            // --- STEP B: ADD ID TO NEW STAFF ---
            if (newStaffId) {
                const newStaff = await Staff.findByPk(newStaffId);
                if (newStaff) {
                    let projects = newStaff.projects;
                    // Parse if necessary
                    if (typeof projects === 'string') projects = JSON.parse(projects);
                    if (!Array.isArray(projects)) projects = [];

                    // Only add the ID if it's not already there (prevents duplicates)
                    if (!projects.map(p => String(p)).includes(String(id))) {
                        projects.push(id);
                        await newStaff.update({ projects });
                    }
                }
            }
        }

        // Fetch final result
        const updatedProject = await Project.findByPk(id, {
            include: [{ model: Staff, attributes: ['name', 'role'] }]
        });

        return res.status(200).json({ success: true, project: updatedProject });
        
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Delete the entire project uploads folder in one shot
        const projectFolderPath = path.join(__dirname, '..', 'uploads', 'projects', id);
        if (fs.existsSync(projectFolderPath)) {
            fs.rmSync(projectFolderPath, { recursive: true, force: true });
            console.log(`✅ Uploads folder deleted for project: ${id}`);
        }

        // Delete related records
        await Payment.destroy({ where: { projectId: id } });
        await Stage.destroy({ where: { projectId: id } });
        
        // Finally delete the project
        const deleted = await Project.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: "Project, stages, payments and files deleted successfully." 
        });

    } catch (error) {
        console.error("Delete Project Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};