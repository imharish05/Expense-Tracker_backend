const express = require('express');
const router = express.Router();
const expenseCtrl = require('../controllers/expenseController');
const { protect } = require('../middleware/protect');

// All expense routes are protected
router.get('/transactions', expenseCtrl.getTransactions);
router.post('/transactions', expenseCtrl.addTransaction);
router.get('/summary', expenseCtrl.getSummary);
router.get('/graph', expenseCtrl.getGraph);

module.exports = router;