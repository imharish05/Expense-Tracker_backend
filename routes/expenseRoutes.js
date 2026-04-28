const express = require('express');
const router = express.Router();
const expenseCtrl = require('../controllers/expenseController');
// const { protect } = require('../middleware/protect'); // Uncomment when ready

// GET all transactions
router.get('/transactions', expenseCtrl.getTransactions);

// POST new transaction
router.post('/transactions', expenseCtrl.addTransaction);

// GET summary (per person)
router.get('/summary', expenseCtrl.getSummary);

// GET graph data
router.get('/graph', expenseCtrl.getGraph);

// UPDATE transaction (Matches your controller)
router.put('/:id', expenseCtrl.updateTransaction);

// DELETE transaction (Matches your controller)
router.delete('/:id', expenseCtrl.deleteTransaction);

module.exports = router;