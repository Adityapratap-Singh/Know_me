const express = require('express');
const router = express.Router();
const { isUpdatingVerified } = require('../middleware');
const educationController = require('../controllers/education');

// EDUCATION ROUTES
// Route to render the form for adding a new education record
router.get('/updating/education/add', isUpdatingVerified, educationController.renderAddEducation);
// Route to handle the submission of a new education record
router.post('/updating/education/add', isUpdatingVerified, educationController.addEducation);

// Route to render the edit form for a single education record
router.get('/updating/education/edit/:id', isUpdatingVerified, educationController.renderEditEducation);
// Route to handle the update of a single education record
router.put('/updating/education/edit/:id', isUpdatingVerified, educationController.editEducation);

// Route to handle the deletion of a single education record
router.delete('/updating/education/delete/:id', isUpdatingVerified, educationController.deleteEducation);

// Route to handle batch deletion
router.post('/updating/education/delete-batch', isUpdatingVerified, educationController.deleteBatchEducation);

// Route to view all education records
router.get('/updating/education/view', isUpdatingVerified, educationController.renderDeleteEducation);

module.exports = router;
