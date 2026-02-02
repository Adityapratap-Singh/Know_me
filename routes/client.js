const express = require('express');
const router = express.Router();
const { isUpdatingVerified } = require('../middleware');
const clientController = require('../controllers/client');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = clientController;

// CLIENT ROUTES
// Route to render the form for adding a new client
router.get('/updating/client/add', isUpdatingVerified, clientController.renderAddClient);
// Route to handle the submission of a new client
router.post('/updating/client/add', isUpdatingVerified, uploadWithErrorHandler, clientController.addClient);

// Route to render the edit form for a single client
router.get('/updating/client/edit/:id', isUpdatingVerified, clientController.renderEditClient);
// Route to handle the update of a single client
router.put('/updating/client/edit/:id', isUpdatingVerified, uploadWithErrorHandler, clientController.editClient);

// Route to handle the deletion of a single client
router.delete('/updating/client/delete/:id', isUpdatingVerified, clientController.deleteClient);

// Route to handle batch deletion
router.post('/updating/client/delete-batch', isUpdatingVerified, clientController.deleteBatchClient);

// Route to view all clients
router.get('/updating/client/view', isUpdatingVerified, clientController.renderDeleteClient);

module.exports = router;
