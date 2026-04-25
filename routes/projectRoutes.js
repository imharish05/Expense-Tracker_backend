const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/all', projectController.getAllProjects);
router.post('/add-project', projectController.createProject);
router.patch('/update-project/:id', projectController.updateProject);
router.delete('/delete-project/:id', projectController.deleteProject);

module.exports = router;