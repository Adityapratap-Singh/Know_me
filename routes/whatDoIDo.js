const express = require('express');
const router = express.Router();
const { isVerified } = require('../../middleware');
const whatDoIDoController = require('../../controllers/whatDoIDo');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = whatDoIDoController;

// WHAT DO I DO ROUTES
// Route to render the form for adding a new "What I Do" item
router.get('/updating/whatDoIDo/add', isVerified, whatDoIDoController.renderAddWhatDoIDoForm);
// Route to handle the submission of a new "What I Do" item
router.post('/updating/whatDoIDo/add', isVerified, uploadWithErrorHandler, whatDoIDoController.addWhatDoIDo);

// Route to render the edit form for a single "What I Do" item
router.get('/updating/whatDoIDo/edit/:id', isVerified, whatDoIDoController.renderEditWhatDoIDoForm);
// Route to handle the update of a single "What I Do" item
router.put('/updating/whatDoIDo/edit/:id', isVerified, uploadWithErrorHandler, whatDoIDoController.updateWhatDoIDo);

// Route to handle the deletion of a single "What I Do" item
router.delete('/updating/whatDoIDo/delete/:id', isVerified, whatDoIDoController.deleteWhatDoIDo);

// Route to view all "What I Do" items
router.get('/updating/whatDoIDo/view', isVerified, whatDoIDoController.viewWhatDoIDo);

module.exports = router;