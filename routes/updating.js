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

/* --- Routes for Adding New Data --- */

// Show the form to add a new contact
router.get('/contact/add', isUpdatingVerified, updatingController.renderAddContact);
// Process the submission to add a new contact
router.post('/contact/add', isUpdatingVerified, updatingController.addContact);

// Show the form to add a new 'What I Do' item
router.get('/whatDoIDo/add', isUpdatingVerified, updatingController.renderAddWhatDoIDo);
// Process the submission to add a new 'What I Do' item, including icon upload
router.post('/whatDoIDo/add', isUpdatingVerified, upload.single('icon'), updatingController.addWhatDoIDo);

// Show the form to add new education details
router.get('/education/add', isUpdatingVerified, updatingController.renderAddEducation);
// Process the submission to add new education details
router.post('/education/add', isUpdatingVerified, updatingController.addEducation);

// Show the form to add new experience details
router.get('/experience/add', isUpdatingVerified, updatingController.renderAddExperience);
// Process the submission to add new experience details
router.post('/experience/add', isUpdatingVerified, updatingController.addExperience);

// Show the form to add new skill details
router.get('/skill/add', isUpdatingVerified, updatingController.renderAddSkill);
// Process the submission to add new skill details
router.post('/skill/add', isUpdatingVerified, updatingController.addSkill);

// Show the form to add a new project
router.get('/project/add', isUpdatingVerified, updatingController.renderAddProject);
// Process the submission to add a new project, including image upload
router.post('/project/add', isUpdatingVerified, upload.single('image'), validateImageDimensions, updatingController.addProject);

// Show the form to add a new testimonial
router.get('/testimonial/add', isUpdatingVerified, updatingController.renderAddTestimonial);
// Process the submission to add a new testimonial, including image upload
router.post('/testimonial/add', isUpdatingVerified, upload.single('image'), validateImageDimensions, updatingController.addTestimonial);

// Show the form to add a new client
router.get('/client/add', isUpdatingVerified, updatingController.renderAddClient);
// Process the submission to add a new client, including logo upload and validation
router.post('/client/add', isUpdatingVerified, upload.single('logo'), validateImageDimensions, updatingController.addClient);

/* --- Routes for Editing Existing Data --- */

// Show the form to edit an existing project
router.get('/project/edit/:id', isUpdatingVerified, updatingController.renderEditProject);
// Process the submission to update an existing project, including image upload
router.put('/project/edit/:id', isUpdatingVerified, upload.single('image'), validateImageDimensions, updatingController.editProject);

// Show the form to edit existing education details
router.get('/education/edit/:id', isUpdatingVerified, updatingController.renderEditEducation);
// Process the submission to update existing education details
router.put('/education/edit/:id', isUpdatingVerified, updatingController.editEducation);

// Show the form to edit an existing client
router.get('/client/edit/:id', isUpdatingVerified, updatingController.renderEditClient);
// Process the submission to update an existing client, including logo upload and validation
router.put('/client/edit/:id', isUpdatingVerified, upload.single('logo'), validateImageDimensions, updatingController.editClient);

// Show the form to edit existing experience details
router.get('/experience/edit/:id', isUpdatingVerified, updatingController.renderEditExperience);
// Process the submission to update existing experience details
router.put('/experience/edit/:id', isUpdatingVerified, updatingController.editExperience);

// Show the form to edit existing skill details
router.get('/skill/edit/:id', isUpdatingVerified, updatingController.renderEditSkill);
// Process the submission to update existing skill details
router.put('/skill/edit/:id', isUpdatingVerified, updatingController.editSkill);

// Show the form to edit an existing testimonial
router.get('/testimonial/edit/:id', isUpdatingVerified, updatingController.renderEditTestimonial);
// Process the submission to update an existing testimonial, including image upload
router.put('/testimonial/edit/:id', isUpdatingVerified, upload.single('image'), validateImageDimensions, updatingController.editTestimonial);

// Show the form to edit an existing "What I Do" item
router.get('/whatDoIDo/edit/:id', isUpdatingVerified, updatingController.renderEditWhatDoIDo);
// Process the submission to update an existing "What I Do" item, including icon upload
router.put('/whatDoIDo/edit/:id', isUpdatingVerified, upload.single('icon'), validateImageDimensions, updatingController.editWhatDoIDo);

/* --- Routes for Deleting Data --- */

// Show the page to select a contact to delete
router.get('/contact/delete', isUpdatingVerified, updatingController.renderDeleteContact);
// Process the request to delete a specific contact
router.delete('/contact/delete/:id', isUpdatingVerified, updatingController.deleteContact);

// Show the page to select a 'What I Do' item to delete
router.get('/whatDoIDo/delete', isUpdatingVerified, updatingController.renderDeleteWhatDoIDo);
// Process the request to delete a specific 'What I Do' item
router.delete('/whatDoIDo/delete/:id', isUpdatingVerified, updatingController.deleteWhatDoIDo);

// Show the page to select education details to delete
router.get('/education/delete', isUpdatingVerified, updatingController.renderDeleteEducation);
// Process the request to delete specific education details
router.delete('/education/delete/:id', isUpdatingVerified, updatingController.deleteEducation);

// Show the page to select experience details to delete
router.get('/experience/delete', isUpdatingVerified, updatingController.renderDeleteExperience);
// Process the request to delete specific experience details
router.delete('/experience/delete/:id', isUpdatingVerified, updatingController.deleteExperience);

// Show the page to select skill details to delete
router.get('/skill/delete', isUpdatingVerified, updatingController.renderDeleteSkill);
// Process the request to delete specific skill details
router.delete('/skill/delete/:id', isUpdatingVerified, updatingController.deleteSkill);

// Show the page to select a project to delete
router.get('/project/delete', isUpdatingVerified, updatingController.renderDeleteProject);
// Process the request to delete a specific project
router.delete('/project/delete/:id', isUpdatingVerified, updatingController.deleteProject);

// Show the page to select a testimonial to delete
router.get('/testimonial/delete', isUpdatingVerified, updatingController.renderDeleteTestimonial);
// Process the request to delete a specific testimonial
router.delete('/testimonial/delete/:id', isUpdatingVerified, updatingController.deleteTestimonial);

// Show the page to select a client to delete
router.get('/client/delete', isUpdatingVerified, updatingController.renderDeleteClient);
// Process the request to delete a specific client
router.delete('/client/delete/:id', isUpdatingVerified, updatingController.deleteClient);

if (process.env.SKIP_DB === 'true') {
  router.post('/debug/cloudinary', upload.single('image'), updatingController.debugCloudinaryUpload);
}
module.exports = router;
