const express = require('express');
const router = express.Router();
const { recordPayment, getAllPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/protect');

router.get('/all', protect, getAllPayments);
router.post('/record', protect, recordPayment);

module.exports = router;