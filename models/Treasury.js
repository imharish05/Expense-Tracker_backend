const mongoose = require('mongoose');

// Main balance tracker per source
const treasurySchema = new mongoose.Schema({
  source: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ["Union Bank", "Indus Bank", "Cash Account"] 
  },
  amount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Individual transaction logs
const treasuryLogSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  beneficiary: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const Treasury = mongoose.model('Treasury', treasurySchema);
const TreasuryLog = mongoose.model('TreasuryLog', treasuryLogSchema);

module.exports = { Treasury, TreasuryLog };