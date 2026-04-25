const Customer = require('../models/Customer');

// 1. Get All Customers
const getAllCustomers = async (req, res) => {
    try {
        // Get page and limit from query, set defaults if not provided
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Customer.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset
        });

        res.status(200).json({ 
            success: true, 
            customers: rows,       // Current page data
            totalItems: count,     // Total records in DB
            totalPages: Math.ceil(count / limit),
            currentPage: page 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// 2. Add New Customer
const addCustomer = async (req, res) => {
    try {
        const { name, address, phone, budget, status } = req.body;

        const existing = await Customer.findOne({ where: { phone } });
        if (existing) {
            return res.status(400).json({ success: false, message: "Customer with this phone already exists" });
        }

        const customer = await Customer.create({
            name, address, phone, budget, status
        });

        res.status(201).json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Update Customer
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        await customer.update(req.body);
        res.status(200).json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        // Using individualHooks: true ensures that for every Project deleted by the cascade,
        // Sequelize will actually call the Project/Stage hooks to clean up files.
        await customer.destroy({ individualHooks: true });

        res.status(200).json({ 
            success: true, 
            message: "Customer, projects, and stages deleted successfully" 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllCustomers, addCustomer, updateCustomer, deleteCustomer };