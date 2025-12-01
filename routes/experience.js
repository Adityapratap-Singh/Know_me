const express = require('express');
const router = express.Router();
const { isVerified } = require('../../middleware');
const experienceController = require('../../controllers/experience');

// EXPERIENCE ROUTES
// Route to render the form for adding a new experience record
router.get('/updating/experience/add', isVerified, experienceController.renderAddExperienceForm);
// Route to handle the submission of a new experience record
router.post('/updating/experience/add', isVerified, experienceController.addExperience);

// Route to render the edit form for a single experience record
router.get('/updating/experience/edit/:id', isVerified, experienceController.renderEditExperienceForm);
// Route to handle the update of a single experience record
router.put('/updating/experience/edit/:id', isVerified, experienceController.updateExperience);

// Route to handle the deletion of a single experience record
router.delete('/updating/experience/delete/:id', isVerified, experienceController.deleteExperience);

// Route to view all experience records
router.get('/updating/experience/view', isVerified, experienceController.viewExperience);

module.exports = router;