const express = require('express');
const router = express.Router();
const { isVerified } = require('../../middleware');
const educationController = require('../../controllers/education');

// EDUCATION ROUTES
// Route to render the form for adding a new education record
router.get('/updating/education/add', isVerified, educationController.renderAddEducationForm);
// Route to handle the submission of a new education record
router.post('/updating/education/add', isVerified, educationController.addEducation);

// Route to render the edit form for a single education record
router.get('/updating/education/edit/:id', isVerified, educationController.renderEditEducationForm);
// Route to handle the update of a single education record
router.put('/updating/education/edit/:id', isVerified, educationController.updateEducation);

// Route to handle the deletion of a single education record
router.delete('/updating/education/delete/:id', isVerified, educationController.deleteEducation);

// Route to view all education records
router.get('/updating/education/view', isVerified, educationController.viewEducation);

module.exports = router;