const express = require('express');
const router = express.Router();
const treasuryController = require('../controllers/treasuryController');

// All routes prefixed with /api/treasury in your server.js
router.get('/status', treasuryController.getTreasuryStatus);
router.post('/add-funds', treasuryController.addFunds);
router.put('/log/:id', treasuryController.updateFund);

// @route   DELETE /api/treasury/log/:id
// @desc    Delete a fund entry and reverse source balance
router.delete('/log/:id', treasuryController.deleteFund);

module.exports = router;