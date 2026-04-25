const express = require('express');
const router = express.Router();
const { getPermissions, updatePermissions } = require('../controllers/permissionController');

router.get('/permissions', getPermissions);
router.post('/update-permissions', updatePermissions);

module.exports = router;