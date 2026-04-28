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