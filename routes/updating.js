const express = require('express');
const router = express.Router();
// Our special check to make sure the user is logged in and verified
const { isVerified } = require('../middleware');
// The brain behind our updating operations
const updatingController = require('../controllers/updating');

// We're pulling out specific tools (like file upload and image validation) from our controller
const { upload, validateImageDimensions } = updatingController;

// --- Routes for managing updates ---

// Show the main update page
router.get('/', updatingController.renderUpdatingMain);

// Handle the login attempt for the update section
router.post('/', updatingController.updateAuthHandler);

// Show the page with all the different update options
router.get('/updatings', isVerified, updatingController.renderUpdatingOptions);

// Process the user's choice from the update options page (add or delete)
router.post('/updatings', isVerified, updatingController.updateOptionsHandler);

// Handle logging out from the update section
router.post('/logout', updatingController.logout);

/* --- Routes for Adding New Data --- */

// Show the form to add a new contact
router.get('/contact/add', isVerified, updatingController.renderAddContact);
// Process the submission to add a new contact
router.post('/contact/add', isVerified, updatingController.addContact);

// Show the form to add a new 'What I Do' item
router.get('/whatDoIDo/add', isVerified, updatingController.renderAddWhatDoIDo);
// Process the submission to add a new 'What I Do' item, including icon upload
router.post('/whatDoIDo/add', isVerified, upload.single('icon'), updatingController.addWhatDoIDo);

// Show the form to add new education details
router.get('/education/add', isVerified, updatingController.renderAddEducation);
// Process the submission to add new education details
router.post('/education/add', isVerified, updatingController.addEducation);

// Show the form to add new experience details
router.get('/experience/add', isVerified, updatingController.renderAddExperience);
// Process the submission to add new experience details
router.post('/experience/add', isVerified, updatingController.addExperience);

// Show the form to add new skill details
router.get('/skill/add', isVerified, updatingController.renderAddSkill);
// Process the submission to add new skill details
router.post('/skill/add', isVerified, updatingController.addSkill);

// Show the form to add a new project
router.get('/project/add', isVerified, updatingController.renderAddProject);
// Process the submission to add a new project, including image upload
router.post('/project/add', isVerified, upload.single('image'), validateImageDimensions, updatingController.addProject);

// Show the form to add a new testimonial
router.get('/testimonial/add', isVerified, updatingController.renderAddTestimonial);
// Process the submission to add a new testimonial, including image upload
router.post('/testimonial/add', isVerified, upload.single('image'), validateImageDimensions, updatingController.addTestimonial);

// Show the form to add a new client
router.get('/client/add', isVerified, updatingController.renderAddClient);
// Process the submission to add a new client, including logo upload and validation
router.post('/client/add', isVerified, upload.single('logo'), validateImageDimensions, updatingController.addClient);

/* --- Routes for Editing Existing Data --- */

// Show the form to edit an existing project
router.get('/project/edit/:id', isVerified, updatingController.renderEditProject);
// Process the submission to update an existing project, including image upload
router.put('/project/edit/:id', isVerified, upload.single('image'), validateImageDimensions, updatingController.editProject);

// Show the form to edit existing education details
router.get('/education/edit/:id', isVerified, updatingController.renderEditEducation);
// Process the submission to update existing education details
router.put('/education/edit/:id', isVerified, updatingController.editEducation);

// Show the form to edit an existing client
router.get('/client/edit/:id', isVerified, updatingController.renderEditClient);
// Process the submission to update an existing client, including logo upload and validation
router.put('/client/edit/:id', isVerified, upload.single('logo'), validateImageDimensions, updatingController.editClient);

/* --- Routes for Deleting Data --- */

// Show the page to select a contact to delete
router.get('/contact/delete', isVerified, updatingController.renderDeleteContact);
// Process the request to delete a specific contact
router.delete('/contact/delete/:id', isVerified, updatingController.deleteContact);

// Show the page to select a 'What I Do' item to delete
router.get('/whatDoIDo/delete', isVerified, updatingController.renderDeleteWhatDoIDo);
// Process the request to delete a specific 'What I Do' item
router.delete('/whatDoIDo/delete/:id', isVerified, updatingController.deleteWhatDoIDo);

// Show the page to select education details to delete
router.get('/education/delete', isVerified, updatingController.renderDeleteEducation);
// Process the request to delete specific education details
router.delete('/education/delete/:id', isVerified, updatingController.deleteEducation);

// Show the page to select experience details to delete
router.get('/experience/delete', isVerified, updatingController.renderDeleteExperience);
// Process the request to delete specific experience details
router.delete('/experience/delete/:id', isVerified, updatingController.deleteExperience);

// Show the page to select skill details to delete
router.get('/skill/delete', isVerified, updatingController.renderDeleteSkill);
// Process the request to delete specific skill details
router.delete('/skill/delete/:id', isVerified, updatingController.deleteSkill);

// Show the page to select a project to delete
router.get('/project/delete', isVerified, updatingController.renderDeleteProject);
// Process the request to delete a specific project
router.delete('/project/delete/:id', isVerified, updatingController.deleteProject);

// Show the page to select a testimonial to delete
router.get('/testimonial/delete', isVerified, updatingController.renderDeleteTestimonial);
// Process the request to delete a specific testimonial
router.delete('/testimonial/delete/:id', isVerified, updatingController.deleteTestimonial);

// Show the page to select a client to delete
router.get('/client/delete', isVerified, updatingController.renderDeleteClient);
// Process the request to delete a specific client
router.delete('/client/delete/:id', isVerified, updatingController.deleteClient);

if (process.env.SKIP_DB === 'true') {
  router.post('/debug/cloudinary', upload.single('image'), updatingController.debugCloudinaryUpload);
}
module.exports = router;
