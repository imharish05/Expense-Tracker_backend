const Transaction = require("../models/expenseModel");

// --- GET GRAPH DATA ---
exports.getGraph = async (req, res) => {
    const range = req.query.range || "monthly";
    let dateFilter = {};

    if (range === "weekly") {
        dateFilter = { created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (range === "monthly") {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        dateFilter = { created_at: { $gte: startOfMonth } };
    }

    try {
        const stats = await Transaction.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        label: { $dateToString: { format: "%d %b", date: "$created_at" } },
                        paid_by: "$paid_by"
                    },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.label": 1 } }
        ]);

        const map = {};
        stats.forEach(r => {
            const label = r._id.label;
            const paidBy = r._id.paid_by;
            if (!map[label]) {
                map[label] = { label, Vijay: 0, Sankaran: 0, Harish: 0 };
            }
            map[label][paidBy] = parseFloat(r.total);
        });

        res.json(Object.values(map));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- GET ALL TRANSACTIONS ---
exports.getTransactions = async (req, res) => {
    try {
        const data = await Transaction.find().sort({ created_at: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- ADD TRANSACTION ---
// --- ADD TRANSACTION ---
exports.addTransaction = async (req, res) => {
    // Destructure 'date' from body
    const { item, amount, paid_by, date } = req.body; 
    try {
        const newEntry = await Transaction.create({ 
            item, 
            amount, 
            paid_by,
            created_at: date ? new Date(date) : undefined 
        });
        res.status(201).json(newEntry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
// --- GET SUMMARY ---
exports.getSummary = async (req, res) => {
    try {
        const summary = await Transaction.aggregate([
            {
                $group: {
                    _id: "$paid_by",
                    spent: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    paid_by: "$_id",
                    spent: 1
                }
            }
        ]);
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};