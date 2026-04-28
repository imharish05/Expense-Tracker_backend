const express = require('express');
const router = express.Router();
const treasuryController = require('../controllers/treasuryController');

// All routes prefixed with /api/treasury in your server.js
router.get('/status', treasuryController.getTreasuryStatus);
router.post('/add-funds', treasuryController.addFunds);

module.exports = router;