const express = require('express');
const router = express.Router();
const { isUpdatingVerified, sendVerificationCode, verifyCode } = require('../middleware');
const updatingController = require('../controllers/updating');

const { upload, validateImageDimensions } = updatingController;

// --- Routes for managing updates ---

// Show the main update page
router.get('/', sendVerificationCode('updating'));

// Handle the login attempt for the update section
router.post('/verify', verifyCode('updating'));

// Show the page with all the different update options
router.get('/updatings', isUpdatingVerified, updatingController.renderUpdatingOptions);

// Process the user's choice from the update options page (add or delete)
router.post('/updatings', isUpdatingVerified, updatingController.updateOptionsHandler);

// Handle logging out from the update section
router.post('/logout', updatingController.logout);

module.exports = router;
