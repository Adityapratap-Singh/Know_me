const express = require('express');
const router = express.Router();
const { isVerified } = require('../../middleware');
const projectController = require('../../controllers/project');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = projectController;

// PROJECT ROUTES
// Route to render the form for adding a new project
router.get('/updating/project/add', isVerified, projectController.renderAddProjectForm);
// Route to handle the submission of a new project
router.post('/updating/project/add', isVerified, uploadWithErrorHandler, projectController.addProject);

// Route to render the edit form for a single project
router.get('/updating/project/edit/:id', isVerified, projectController.renderEditProjectForm);
// Route to handle the update of a single project
router.put('/updating/project/edit/:id', isVerified, uploadWithErrorHandler, projectController.updateProject);

// Route to handle the deletion of a single project
router.delete('/updating/project/delete/:id', isVerified, projectController.deleteProject);

// Route to view all projects
router.get('/updating/project/view', isVerified, projectController.viewProjects);

module.exports = router;