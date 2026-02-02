const express = require('express');
const router = express.Router();
const { isUpdatingVerified } = require('../middleware');
const experienceController = require('../controllers/experience');

// EXPERIENCE ROUTES
// Route to render the form for adding a new experience record
router.get('/updating/experience/add', isUpdatingVerified, experienceController.renderAddExperience);
// Route to handle the submission of a new experience record
router.post('/updating/experience/add', isUpdatingVerified, experienceController.addExperience);

// Route to render the edit form for a single experience record
router.get('/updating/experience/edit/:id', isUpdatingVerified, experienceController.renderEditExperience);
// Route to handle the update of a single experience record
router.put('/updating/experience/edit/:id', isUpdatingVerified, experienceController.editExperience);

// Route to handle the deletion of a single experience record
router.delete('/updating/experience/delete/:id', isUpdatingVerified, experienceController.deleteExperience);

// Route to handle batch deletion
router.post('/updating/experience/delete-batch', isUpdatingVerified, experienceController.deleteBatchExperience);

// Route to view all experience records
router.get('/updating/experience/view', isUpdatingVerified, experienceController.renderDeleteExperience);

module.exports = router;
