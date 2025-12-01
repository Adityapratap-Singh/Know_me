const express = require('express');
const router = express.Router();
const { isVerified, isContactsVerified } = require('../middleware');
const contactController = require('../controllers/contact');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = contactController;

// CONTACT
router.get('/contact', contactController.renderContactForm);
router.post('/contact', uploadWithErrorHandler, contactController.submitContactForm);

router.get('/verify-contacts', contactController.renderVerifyContacts);
router.post('/verify-contacts', contactController.verifyContacts);

router.get('/view-contacts', isContactsVerified, contactController.viewContacts);

// Route to view a single contact
router.get('/contacts/:id', isContactsVerified, contactController.viewSingleContact);

router.delete('/contacts/:id', isContactsVerified, contactController.deleteContact);

// Route to render the edit form for a single contact
router.get('/contacts/:id/edit', isContactsVerified, contactController.renderEditContactForm);

// Route to handle the update of a single contact
router.put('/contacts/:id', isContactsVerified, uploadWithErrorHandler, contactController.updateContact);

module.exports = router;
