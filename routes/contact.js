const express = require('express');
const router = express.Router();
const { isContactViewingVerified, isUpdatingVerified, sendVerificationCode, verifyCode, contactLimiter } = require('../middleware');
const contactController = require('../controllers/contact');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = contactController;

// CONTACT
router.get('/contact', contactController.renderContactForm);
router.post('/contact', contactLimiter, uploadWithErrorHandler, contactController.submitContactForm);

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

// --- Admin "Updating" Routes (Consistent with other resources) ---
router.get('/updating/contact/add', isUpdatingVerified, contactController.renderAddContact);
router.post('/updating/contact/add', isUpdatingVerified, contactController.addContact);
router.post('/updating/contact/delete-batch', isUpdatingVerified, contactController.deleteBatchContact);
router.get('/updating/contact/view', isUpdatingVerified, contactController.renderDeleteContact);

module.exports = router;
