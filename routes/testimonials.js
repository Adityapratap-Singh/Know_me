const express = require('express');
const router = express.Router();
const { isUpdatingVerified } = require('../middleware');
const testimonialController = require('../controllers/testimonials');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = testimonialController;

// TESTIMONIAL ROUTES
// Route to render the form for adding a new testimonial record
router.get('/updating/testimonial/add', isUpdatingVerified, testimonialController.renderAddTestimonial);
// Route to handle the submission of a new testimonial record
router.post('/updating/testimonial/add', isUpdatingVerified, uploadWithErrorHandler, testimonialController.addTestimonial);

// Route to render the edit form for a single testimonial record
router.get('/updating/testimonial/edit/:id', isUpdatingVerified, testimonialController.renderEditTestimonial);
// Route to handle the update of a single testimonial record
router.put('/updating/testimonial/edit/:id', isUpdatingVerified, uploadWithErrorHandler, testimonialController.editTestimonial);

// Route to handle the deletion of a single testimonial record
router.delete('/updating/testimonial/delete/:id', isUpdatingVerified, testimonialController.deleteTestimonial);

// Route to handle batch deletion
router.post('/updating/testimonial/delete-batch', isUpdatingVerified, testimonialController.deleteBatchTestimonial);

// Route to view all testimonial records
router.get('/updating/testimonial/view', isUpdatingVerified, testimonialController.renderDeleteTestimonial);

module.exports = router;
