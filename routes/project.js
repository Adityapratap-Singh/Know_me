const express = require('express');
const router = express.Router();
const { isUpdatingVerified } = require('../middleware');
const projectController = require('../controllers/project');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = projectController;

// PROJECT ROUTES
// Route to render the form for adding a new project
router.get('/updating/project/add', isUpdatingVerified, projectController.renderAddProject);
// Route to handle the submission of a new project
router.post('/updating/project/add', isUpdatingVerified, uploadWithErrorHandler, projectController.addProject);

// Route to render the edit form for a single project
router.get('/updating/project/edit/:id', isUpdatingVerified, projectController.renderEditProject);
// Route to handle the update of a single project
router.put('/updating/project/edit/:id', isUpdatingVerified, uploadWithErrorHandler, projectController.editProject);

// Route to handle the deletion of a single project record
router.delete('/updating/project/delete/:id', isUpdatingVerified, projectController.deleteProject);

// Route to handle batch deletion
router.post('/updating/project/delete-batch', isUpdatingVerified, projectController.deleteBatchProject);

// Route to view all project records
router.get('/updating/project/view', isUpdatingVerified, projectController.renderDeleteProject);

module.exports = router;
