const express = require('express');
const router = express.Router();
const stageController = require('../controllers/stageController');
const multer = require('multer');

const upload = require("../middleware/upload.js")

router.get('/all-stages', stageController.getAllStages);
router.get('/reminders', stageController.getPaymentReminders);
router.get('/overdue-alerts', stageController.getOverdueStages);
router.get('/total-paid', stageController.getTotalPaidAmount);
router.get('/project/:projectId', stageController.getProjectStages);
router.post('/add-stage/:projectId', stageController.addStage);
router.put('/record-payment/:stageId', stageController.recordPayment);
router.patch('/update-status/:stageId', stageController.updateStageStatus);
router.post('/upload-document/:projectId/:stageId', upload.array('documents'), stageController.uploadDocument);
router.delete('/delete-document/:stageId', stageController.deleteDocument);

module.exports = router;