const express = require('express');
const router = express.Router();
const { isUpdatingVerified } = require('../middleware');
const whatDoIDoController = require('../controllers/whatDoIDo');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = whatDoIDoController;

// WHAT DO I DO ROUTES
// Route to render the form for adding a new "What I Do" item
router.get('/updating/whatDoIDo/add', isUpdatingVerified, whatDoIDoController.renderAddWhatDoIDo);
// Route to handle the submission of a new "What I Do" item
router.post('/updating/whatDoIDo/add', isUpdatingVerified, uploadWithErrorHandler, whatDoIDoController.addWhatDoIDo);

// Route to render the edit form for a single "What I Do" item
router.get('/updating/whatDoIDo/edit/:id', isUpdatingVerified, whatDoIDoController.renderEditWhatDoIDo);
// Route to handle the update of a single "What I Do" item
router.put('/updating/whatDoIDo/edit/:id', isUpdatingVerified, uploadWithErrorHandler, whatDoIDoController.editWhatDoIDo);

// Route to handle the deletion of a single "What I Do" item
router.delete('/updating/whatDoIDo/delete/:id', isUpdatingVerified, whatDoIDoController.deleteWhatDoIDo);

// Route to handle batch deletion
router.post('/updating/whatDoIDo/delete-batch', isUpdatingVerified, whatDoIDoController.deleteBatchWhatDoIDo);

// Route to view all "What I Do" items
router.get('/updating/whatDoIDo/view', isUpdatingVerified, whatDoIDoController.renderDeleteWhatDoIDo);

module.exports = router;
