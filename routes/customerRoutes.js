const express = require('express');
const router = express.Router();
const { 
    getAllCustomers, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer 
} = require('../controllers/customerController');

// All routes here are prefixed with /customers in your server.js

// GET /customers/all
router.get('/all', getAllCustomers);

// POST /customers/add-customer
router.post('/add-customer', addCustomer);

// PATCH /customers/update-customer/:id
router.patch('/update-customer/:id', updateCustomer);

// DELETE /customers/delete-customer/:id
router.delete('/delete-customer/:id', deleteCustomer);

module.exports = router;