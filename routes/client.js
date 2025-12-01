const express = require('express');
const router = express.Router();
const { isVerified } = require('../../middleware');
const clientController = require('../../controllers/client');

// Destructure uploadWithErrorHandler from the controller
const { uploadWithErrorHandler } = clientController;

// CLIENT ROUTES
// Route to render the form for adding a new client
router.get('/updating/client/add', isVerified, clientController.renderAddClientForm);
// Route to handle the submission of a new client
router.post('/updating/client/add', isVerified, uploadWithErrorHandler, clientController.addClient);

// Route to render the edit form for a single client
router.get('/updating/client/edit/:id', isVerified, clientController.renderEditClientForm);
// Route to handle the update of a single client
router.put('/updating/client/edit/:id', isVerified, uploadWithErrorHandler, clientController.updateClient);

// Route to handle the deletion of a single client
router.delete('/updating/client/delete/:id', isVerified, clientController.deleteClient);

// Route to view all clients
router.get('/updating/client/view', isVerified, clientController.viewClients);

module.exports = router;