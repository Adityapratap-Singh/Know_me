const express = require('express');
const router = express.Router();
const { isVerified } = require('../../middleware');
const skillController = require('../../controllers/skill');

// SKILL ROUTES
// Route to render the form for adding a new skill record
router.get('/updating/skill/add', isVerified, skillController.renderAddSkillForm);
// Route to handle the submission of a new skill record
router.post('/updating/skill/add', isVerified, skillController.addSkill);

// Route to render the edit form for a single skill record
router.get('/updating/skill/edit/:id', isVerified, skillController.renderEditSkillForm);
// Route to handle the update of a single skill record
router.put('/updating/skill/edit/:id', isVerified, skillController.updateSkill);

// Route to handle the deletion of a single skill record
router.delete('/updating/skill/delete/:id', isVerified, skillController.deleteSkill);

// Route to view all skill records
router.get('/updating/skill/view', isVerified, skillController.viewSkills);

module.exports = router;