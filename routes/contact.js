const express = require('express');
const router = express.Router();
const { isContactViewingVerified, sendVerificationCode, verifyCode } = require('../middleware');
const contactController = require('../controllers/contact');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = contactController;

// CONTACT
router.get('/contact', contactController.renderContactForm);
router.post('/contact', uploadWithErrorHandler, contactController.submitContactForm);

router.get('/verify-contacts', sendVerificationCode('viewing contacts'));
router.post('/verify-contacts/check', verifyCode('viewing contacts'));

router.get('/view-contacts', isContactViewingVerified, contactController.viewContacts);

// Route to view a single contact
router.get('/contacts/:id', isContactViewingVerified, contactController.viewSingleContact);

router.delete('/contacts/:id', isContactViewingVerified, contactController.deleteContact);

// Route to render the edit form for a single contact
router.get('/contacts/:id/edit', isContactViewingVerified, contactController.renderEditContactForm);

// Route to handle the update of a single contact
router.put('/contacts/:id', isContactViewingVerified, uploadWithErrorHandler, contactController.updateContact);

module.exports = router;
