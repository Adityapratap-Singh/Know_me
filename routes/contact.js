const express = require('express');
const router = express.Router();
const { isVerified, isContactsVerified } = require('../middleware');
const contactController = require('../controllers/contact');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = contactController;

// CONTACT
router.get('/contact', contactController.renderContactForm);
router.post('/contact', uploadWithErrorHandler, contactController.submitContactForm);

router.get('/verify-contacts', isVerified, contactController.renderVerifyContacts);
router.post('/verify-contacts', isVerified, contactController.verifyContacts);

router.get('/view-contacts', isVerified, isContactsVerified, contactController.viewContacts);

// Route to view a single contact
router.get('/contacts/:id', isVerified, isContactsVerified, contactController.viewSingleContact);

router.delete('/contacts/:id', isVerified, isContactsVerified, contactController.deleteContact);

module.exports = router;