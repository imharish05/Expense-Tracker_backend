const express = require('express');
const router = express.Router();
const { 
    addStaff, 
    getAllStaffs, 
    updateStaff, 
    deleteStaff,
    toggleProjectAssignment 
} = require('../controllers/staffController');

// Staff CRUD
router.get('/all', getAllStaffs);
router.post('/add-staff', addStaff);
router.patch('/update/:id', updateStaff);
router.delete('/delete/:id', deleteStaff);

// Project Assignment
router.post('/toggle-project', toggleProjectAssignment);

module.exports = router;