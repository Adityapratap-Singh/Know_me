const express = require('express');
const router = express.Router();
const { isUpdatingVerified } = require('../middleware');
const skillController = require('../controllers/skill');

// SKILL ROUTES
// Route to render the form for adding a new skill record
router.get('/updating/skill/add', isUpdatingVerified, skillController.renderAddSkill);
// Route to handle the submission of a new skill record
router.post('/updating/skill/add', isUpdatingVerified, skillController.addSkill);

// Route to render the edit form for a single skill record
router.get('/updating/skill/edit/:id', isUpdatingVerified, skillController.renderEditSkill);
// Route to handle the update of a single skill record
router.put('/updating/skill/edit/:id', isUpdatingVerified, skillController.editSkill);

// Route to handle the deletion of a single skill record
router.delete('/updating/skill/delete/:id', isUpdatingVerified, skillController.deleteSkill);

// Route to handle batch deletion
router.post('/updating/skill/delete-batch', isUpdatingVerified, skillController.deleteBatchSkill);

// Route to view all skill records
router.get('/updating/skill/view', isUpdatingVerified, skillController.renderDeleteSkill);

module.exports = router;
