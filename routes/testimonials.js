const express = require('express');
const router = express.Router();
const { isVerified } = require('../../middleware');
const testimonialController = require('../../controllers/testimonials');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = testimonialController;

// TESTIMONIAL ROUTES
// Route to render the form for adding a new testimonial record
router.get('/updating/testimonial/add', isVerified, testimonialController.renderAddTestimonialForm);
// Route to handle the submission of a new testimonial record
router.post('/updating/testimonial/add', isVerified, uploadWithErrorHandler, testimonialController.addTestimonial);

// Route to render the edit form for a single testimonial record
router.get('/updating/testimonial/edit/:id', isVerified, testimonialController.renderEditTestimonialForm);
// Route to handle the update of a single testimonial record
router.put('/updating/testimonial/edit/:id', isVerified, uploadWithErrorHandler, testimonialController.updateTestimonial);

// Route to handle the deletion of a single testimonial record
router.delete('/updating/testimonial/delete/:id', isVerified, testimonialController.deleteTestimonial);

// Route to view all testimonial records
router.get('/updating/testimonial/view', isVerified, testimonialController.viewTestimonials);

module.exports = router;