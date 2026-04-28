const { Treasury, TreasuryLog } = require('../models/Treasury');

// GET: Fetch status, total balance, and all logs
exports.getTreasuryStatus = async (req, res) => {
  try {
    const balances = await Treasury.find();
    const recentLogs = await TreasuryLog.find().sort({ date: -1 }); // Get all logs for the breakdown calculation

    const totalBalance = balances.reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      totalBalance,
      balances,
      recentLogs
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch treasury data", error: error.message });
  }
};

// POST: Add funds, update source balance, and create audit log
// POST: Add funds, update source balance, and create audit log
exports.addFunds = async (req, res) => {
  const { amount, source, beneficiary, description, date } = req.body;

  console.log(date);
  

  try {
    // 1. Update or Create the source balance
    await Treasury.findOneAndUpdate(
      { source: source },
      { 
        $inc: { amount: Number(amount) }, 
        $set: { lastUpdated: new Date() } 
      },
      { upsert: true, new: true }
    );

    // 2. Create the log entry
    // Convert the string date from the frontend into a JS Date object
    const logEntry = new TreasuryLog({
      amount: Number(amount),
      source,
      beneficiary,
      description,
      date: date ? new Date(date) : new Date() 
    });

    await logEntry.save();
    res.status(200).json({ success: true, message: "Funds injected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Transaction failed", error: error.message });
  }
};

exports.updateFund = async (req, res) => {
    const { amount, source, beneficiary, description, date } = req.body;
    try {
        const oldLog = await TreasuryLog.findById(req.params.id);
        
        // Adjust balance: Subtract old amount, add new amount
        await Treasury.findOneAndUpdate(
            { source: oldLog.source },
            { $inc: { amount: -Number(oldLog.amount) } }
        );
        await Treasury.findOneAndUpdate(
            { source: source },
            { $inc: { amount: Number(amount) }, $set: { lastUpdated: new Date() } },
            { upsert: true }
        );

        const updated = await TreasuryLog.findByIdAndUpdate(req.params.id, {
            amount, source, beneficiary, description, date: new Date(date)
        }, { new: true });

        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFund = async (req, res) => {
    try {
        const log = await TreasuryLog.findById(req.params.id);
        if (log) {
            // Reverse the balance in Treasury
            await Treasury.findOneAndUpdate(
                { source: log.source },
                { $inc: { amount: -Number(log.amount) } }
            );
            await TreasuryLog.findByIdAndDelete(req.params.id);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};