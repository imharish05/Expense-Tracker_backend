const { Payment, Stage, sequelize } = require('../models');

exports.recordPayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { 
            amount, 
            payment_mode, 
            payment_date, 
            customerId, 
            budget, 
            customerName, 
            projectName, 
            stageId, 
            projectId,
            payment_status,
            stage_amount 
        } = req.body;

        // Validate required fields
        if (!amount || !stageId || !projectId) {
            await t.rollback();
            return res.status(400).json({ message: "amount, stageId and projectId are required" });
        }

        const payment = await Payment.create({
            amount,
            payment_mode,
            payment_date,
            customerId,
            budget,
            customerName,
            projectName,
            stageId,
            projectId,
            payment_status,
            stage_amount
        }, { transaction: t });

        // Update Stage paid amount
        const stage = await Stage.findByPk(stageId, { transaction: t });
        if (stage) {
            const newPaidTotal = parseFloat(stage.paid || 0) + parseFloat(amount);
            const newStatus = newPaidTotal >= parseFloat(stage.amount) ? "Paid" : "Partially Paid";

            await stage.update({ 
                paid: newPaidTotal,
                payment_status: newStatus,
                // Also mark completion_notified false so cron picks it up again if needed
                completion_notified: false
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json(payment);
    } catch (error) {
        await t.rollback();
        console.error("Payment Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({ 
            order: [['createdAt', 'DESC']] 
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};