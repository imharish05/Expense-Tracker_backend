const Stage = require('../models/Stage');
const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

/**
 * 1. Fetch all stages for a specific project
 */
exports.getProjectStages = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const stages = await Stage.findAll({ 
            where: { projectId },
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json({ 
            success: true, 
            projectId,
            stages 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 2. Add New Stage to a Project
 */
exports.addStage = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Fix duration: convert empty string to null, validate date
        let duration = null;
        if (req.body.duration && String(req.body.duration).trim() !== "") {
            const parsed = new Date(req.body.duration);
            if (!isNaN(parsed.getTime())) {
                duration = parsed;
            }
        }

        console.log("Received duration:", req.body.duration);
        console.log("Parsed duration:", duration);

        const stage = await Stage.create({ 
            ...req.body, 
            projectId,
            duration  // override with sanitized value
        });

        res.status(201).json({ success: true, stage });
    } catch (error) {
        console.error("Stage create error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * 3. Update Stage Status
 */
// 3. Update Stage Status
exports.updateStageStatus = async (req, res) => {
    try {
        const { stageId } = req.params;
        const { status } = req.body;

        const stage = await Stage.findByPk(stageId, {
            include: [{ model: Project, attributes: ['projectName'] }]
        });
        if (!stage) return res.status(404).json({ message: "Stage not found" });

        await stage.update({ status });

        // NEW: check if this triggers a notification
        const isUnpaidCompleted = status === 'Completed' && 
            Number(stage.paid) < Number(stage.amount);

        res.status(200).json({ 
            success: true, 
            status: stage.status,
            reminder: isUnpaidCompleted,          // NEW
            stage: stage.toJSON()                 // NEW
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Record Payment
exports.recordPayment = async (req, res) => {
    try {
        const { stageId } = req.params;
        const { amount, payment_mode, payment_date, payment_status } = req.body;

        const stage = await Stage.findByPk(stageId);
        if (!stage) return res.status(404).json({ message: "Stage not found" });

        const currentPaid = parseFloat(stage.paid) || 0;
        const incomingAmount = parseFloat(amount) || 0;
        const totalPaid = currentPaid + incomingAmount;
        const newStatus = totalPaid >= parseFloat(stage.amount) ? "Completed" : "In Progress";

        await stage.update({
            paid: amount,
            payment_mode,
            payment_date,
            payment_status,
            status: newStatus
        });

        // NEW: notify if payment completed the stage but balance remains
        const isUnpaidCompleted = newStatus === 'Completed' && 
            totalPaid < parseFloat(stage.amount);

        res.status(200).json({ 
            success: true, 
            stage,
            reminder: isUnpaidCompleted           // NEW
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * 5. Upload Document
 */
exports.uploadDocument = async (req, res) => {
    try {
        const { stageId } = req.params;
        const { projectId } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const stage = await Stage.findByPk(stageId);
        if (!stage) return res.status(404).json({ message: "Stage not found" });

        // Store clean forward-slash paths relative to server root
        const filePaths = req.files.map(file => 
            `uploads/projects/${projectId}/stages/${stageId}/${file.filename}`
        ).join(',');

        await stage.update({ documentPath: filePaths });

        res.status(200).json({ 
            success: true, 
            file_path: filePaths 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 6. Delete Document
 */
/**
 * Helper — delete a folder and all its contents recursively
 */
const deleteFolderIfExists = (folderPath) => {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
    }
};

/**
 * 6. Delete Document — also cleans up empty stage folder
 */
exports.deleteDocument = async (req, res) => {
    try {
        const { stageId } = req.params;
        const stage = await Stage.findByPk(stageId);

        if (!stage || !stage.documentPath) {
            return res.status(404).json({ message: "No document found" });
        }

        // ✅ Delete the entire stage folder instead of individual files
        const stageFolderPath = path.join(__dirname, '..', 'uploads', 'projects', stage.projectId, 'stages', stageId);
        deleteFolderIfExists(stageFolderPath);

        await stage.update({ documentPath: null });
        res.status(200).json({ success: true, message: "File(s) deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
/**
 * 7. Get Total Paid Amount
 */
exports.getTotalPaidAmount = async (req, res) => {
    try {
        const totalPaid = await Stage.sum('paid');
        res.status(200).json({
            success: true,
            totalCollected: totalPaid || 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 8. Get All Stages (for stats/notifications)
 */
exports.getAllStages = async (req, res) => {
    try {
        const stages = await Stage.findAll({
            include: [{ 
                model: Project, 
                attributes: ['projectName', 'customerName'] 
            }],
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json({ 
            success: true, 
            stages 
        });
    } catch (error) {
        console.error("Error in getAllStages:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 9. Get Payment Reminders (overdue + unpaid completed)
 */
exports.getPaymentReminders = async (req, res) => {
    try {
        const today = new Date();
        const reminders = await Stage.findAll({
            where: {
                [Op.or]: [
                    {
                        duration: { [Op.lt]: today },
                        paid: { [Op.lt]: Stage.sequelize.col('amount') }
                    },
                    {
                        status: 'Completed',
                        paid: { [Op.lt]: Stage.sequelize.col('amount') }
                    }
                ]
            },
            include: [{ 
                model: Project, 
                attributes: ['projectName', 'customerName'] 
            }]
        });

        // Format reminders to include projectName at top level
        const formatted = reminders.map(r => ({
            ...r.toJSON(),
            projectName: r.Project?.projectName || "Unknown Project",
            customerName: r.Project?.customerName || ""
        }));

        res.json({ success: true, reminders: formatted });
    } catch (error) {
        console.error("Reminder Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * 10. Get Overdue Stages
 */
exports.getOverdueStages = async (req, res) => {
    try {
        const now = new Date();
        const overdueStages = await Stage.findAll({
            where: {
                status: { [Op.ne]: 'Completed' },
                duration: { [Op.lte]: now },
                duration: { [Op.ne]: null }
            },
            include: [{ 
                model: Project,
                attributes: ['projectName'] 
            }],
            order: [['duration', 'ASC']]
        });

        const formattedNotifications = overdueStages.map(stage => ({
            id: stage.id,
            title: 'Deadline Reached!',
            message: `Stage "${stage.stage_Name}" for project ${stage.Project?.projectName || 'Unknown'} is due.`,
            projectId: stage.projectId,
            timestamp: stage.duration
        }));

        res.status(200).json(formattedNotifications);
    } catch (error) {
        console.error("Error fetching overdue stages:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};