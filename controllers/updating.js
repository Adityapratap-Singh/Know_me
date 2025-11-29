// This file acts as the central hub for all update-related operations in our application.
// It handles everything from displaying forms to processing data additions, edits, and deletions
// across various parts of the portfolio, including image uploads and validation.

// We bring in all the necessary data models to interact with our database.
const whatDoIDo = require('../models/whatDoIDo');
const testimonial = require('../models/testimonials');
const education = require('../models/education');
const experience = require('../models/experience');
const skill = require('../models/skill');
const project = require('../models/project');
const contact = require('../models/contact');
const client = require('../models/client');

// Tools for handling image uploads and storage (Cloudinary is our cloud storage provider).
const { storage, cloudinary } = require('../cloudinary');
const multer = require('multer'); // Multer helps us process file uploads.
const upload = multer({ storage }); // This configures Multer to use our Cloudinary storage setup.
const Jimp = require('jimp'); // Jimp is an image processing library to check image details.

// We're setting a minimum size for uploaded images (like client logos) to ensure quality.
const MIN_WIDTH = 100; // The smallest width an image should have.
const MIN_HEIGHT = 100; // The smallest height an image should have.

// This special check makes sure that any uploaded image meets our minimum size requirements.
// If an image is too small, we'll stop the process and let the user know.
const validateImageDimensions = async (req, res, next) => {
    // If no file was uploaded, we just move on.
    if (!req.file) {
        return next();
    }

    try {
        // We use Jimp to read the image details from the uploaded file.
        const image = await Jimp.read(req.file.path);
        const { width, height } = image.bitmap; // Get the actual width and height of the image.

        // If the image is smaller than our minimums...
        if (width < MIN_WIDTH || height < MIN_HEIGHT) {
            // ...we'll delete the image from Cloudinary (where it was temporarily stored).
            if (req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            // Then, we'll send an error message back to the user.
            return res.status(400).send(`Oops! Your image needs to be at least ${MIN_WIDTH}x${MIN_HEIGHT} pixels. Please try a larger one.`);
        }
        // If the image is good, we let the process continue.
        next();
    } catch (error) {
        // If something goes wrong while checking the image, we log the error and tell the user.
        console.error('Something went wrong while checking the image size:', error);
        return res.status(500).send('We had trouble processing your image. Please try again.');
    }
};

// --- Functions for Handling Update Pages and Authentication ---

// Renders the main page where users can start the update process.
module.exports.renderUpdatingMain = (req, res) => {
    res.render('inputs/updating/updating');
};

// Handles the secret code submission to grant access to the update section.
module.exports.updateAuthHandler = (req, res) => {
    const { secret } = req.body;
    // If the secret code is correct, we mark the user as authenticated for updating.
    if (secret == process.env.secretkey) {
        req.session.isAuthenticated = true;
        req.session.isUpdating = true;
        return res.redirect('/updating/updatings'); // Send them to the update options page.
    }
    // If the code is wrong, we let them know.
    console.log('Someone tried to log in with an invalid secret code.');
    res.status(400).send('That secret code isn\'t quite right. Please try again!');
};

// Renders the page where users choose what they want to update (e.g., add a project, delete a client).
module.exports.renderUpdatingOptions = (req, res) => {
    res.render('inputs/updating/updatings');
};

// Processes the user's choice from the update options page.
module.exports.updateOptionsHandler = (req, res) => {
    const { updates, action } = req.body;
    // Redirects the user to the specific add or delete form based on their choice.
    if (action === 'add') {
        return res.redirect(`/updating/${updates}/add`);
    }
    if (action === 'delete') {
        return res.redirect(`/updating/${updates}/delete`);
    }
    // If the action isn't recognized, something went wrong.
    res.status(400).send('We couldn\'t understand your request. Please try again.');
};

// Handles logging out from the update section, clearing the session.
module.exports.logout = (req, res) => {
    req.session.destroy(); // Clears all session data.
    res.redirect('/updating'); // Sends the user back to the main update login page.
};

// --- Functions for Adding New Data ---

// Renders the form to add a new contact entry.
module.exports.renderAddContact = (req, res) => {
    res.render('inputs/updatingContact', { action: 'add' });
};

// Processes the submission of a new contact form and saves it to the database.
module.exports.addContact = async (req, res) => {
    const newContact = new contact(req.body);
    await newContact.save(); // Save the new contact details.
    res.redirect('/view-contacts'); // Redirect to view all contacts.
};

// Renders the form to add a new 'What I Do' item.
module.exports.renderAddWhatDoIDo = (req, res) => {
    res.render('inputs/updatingWhatdoIdo', { action: 'add' });
};

// Processes the submission for a new 'What I Do' item, including icon upload.
module.exports.addWhatDoIDo = async (req, res) => {
    const { title, description } = req.body;
    const newWhatDoIDo = new whatDoIDo({ title, description });
    // If an icon was uploaded, save its Cloudinary URL and filename.
    if (req.file) {
        newWhatDoIDo.icon = { url: req.file.path, filename: req.file.filename };
    }
    await newWhatDoIDo.save(); // Save the new item.
    res.redirect('/profile'); // Redirect to the profile page to see the update.
};

// Renders the form to add new education details.
module.exports.renderAddEducation = (req, res) => {
    res.render('inputs/updatingEducation', { action: 'add' });
};

// Processes the submission for new education details.
module.exports.addEducation = async (req, res) => {
    const newEducation = new education(req.body);
    await newEducation.save(); // Save the new education entry.
    res.redirect('/resume'); // Redirect to the resume page.
};

// Renders the form to add new experience details.
module.exports.renderAddExperience = (req, res) => {
    res.render('inputs/updatingExperience', { action: 'add' });
};

// Processes the submission for new experience details.
module.exports.addExperience = async (req, res) => {
    const newExperience = new experience(req.body);
    await newExperience.save(); // Save the new experience entry.
    res.redirect('/resume'); // Redirect to the resume page.
};

// Renders the form to add new skill details.
module.exports.renderAddSkill = (req, res) => {
    res.render('inputs/updatingSkills', { action: 'add' });
};

// Processes the submission for new skill details.
module.exports.addSkill = async (req, res) => {
    const newSkill = new skill(req.body);
    await newSkill.save(); // Save the new skill entry.
    res.redirect('/resume'); // Redirect to the resume page.
};

// Renders the form to add a new project.
module.exports.renderAddProject = (req, res) => {
    res.render('inputs/updatingProject', { action: 'add' });
};

// Processes the submission for a new project, including image upload.
module.exports.addProject = async (req, res) => {
    const { category, title, link, description, technologies } = req.body;
    // Technologies are expected as a comma-separated string, so we convert it to an array.
    const techArray = technologies.split(',').map(t => t.trim());
    const newProject = new project({ category, title, link, description, technologies: techArray });
    // If an image was uploaded, save its Cloudinary URL and filename.
    if (req.file) {
        newProject.image = { url: req.file.path, filename: req.file.filename };
    }
    await newProject.save(); // Save the new project.
    res.redirect('/portfolio'); // Redirect to the portfolio page.
};

// Renders the form to add a new testimonial.
module.exports.renderAddTestimonial = (req, res) => {
    res.render('inputs/updatingTestimonials', { action: 'add' });
};

// Processes the submission for a new testimonial, including image upload.
module.exports.addTestimonial = async (req, res) => {
    const { name, position, testimonial: testimonialBody } = req.body;
    const newTestimonial = new testimonial({ name, position, testimonial: testimonialBody });
    // If an image was uploaded, save its Cloudinary URL and filename.
    if (req.file) {
        newTestimonial.image = { url: req.file.path, filename: req.file.filename };
    }
    await newTestimonial.save(); // Save the new testimonial.
    res.redirect('/profile'); // Redirect to the profile page.
};

// Renders the form to add a new client.
module.exports.renderAddClient = (req, res) => {
    res.render('inputs/updatingClient', { action: 'add' });
};

// Processes the submission for a new client, including logo upload and validation.
module.exports.addClient = async (req, res) => {
    const { name, website, description } = req.body;
    const newClient = new client({ name, website, description });
    // If a logo was uploaded, save its Cloudinary URL and filename.
    if (req.file) {
        newClient.logo = { url: req.file.path, filename: req.file.filename };
    }
    await newClient.save(); // Save the new client.
    res.redirect('/profile'); // Redirect to the profile page.
};

// --- Functions for Editing Existing Data ---

// Renders the form to edit an existing project, pre-filling with current data.
module.exports.renderEditProject = async (req, res) => {
    const data = await project.findById(req.params.id); // Find the project by its ID.
    res.render('inputs/updatingProject', { action: 'edit', data });
};

// Processes the submission to update an existing project, handling new image uploads.
module.exports.editProject = async (req, res) => {
    const { id } = req.params;
    const { category, title, link, description, technologies } = req.body;
    const techArray = technologies.split(',').map(t => t.trim());
    // Find and update the project details.
    const updatedProject = await project.findByIdAndUpdate(id, { category, title, link, description, technologies: techArray });
    // If a new image was uploaded, update its Cloudinary URL and filename, and delete the old image.
    if (req.file) {
        if (updatedProject.image && updatedProject.image.filename) {
            await cloudinary.uploader.destroy(updatedProject.image.filename); // Delete old image from Cloudinary.
        }
        updatedProject.image = { url: req.file.path, filename: req.file.filename };
        await updatedProject.save(); // Save the updated project with the new image.
    }
    res.redirect('/portfolio'); // Redirect to the portfolio page.
};

// Renders the form to edit existing education details, pre-filling with current data.
module.exports.renderEditEducation = async (req, res) => {
    const data = await education.findById(req.params.id); // Find the education entry by its ID.
    res.render('inputs/updatingEducation', { action: 'edit', data });
};

// Processes the submission to update existing education details.
module.exports.editEducation = async (req, res) => {
    const { id } = req.params;
    const newEducation = new education(req.body); // Create a new education object from the form data.
    await education.findByIdAndUpdate(id, newEducation); // Find and update the education entry.
    res.redirect('/resume'); // Redirect to the resume page.
};

// Renders the form to edit an existing client, pre-filling with current data.
module.exports.renderEditClient = async (req, res) => {
    const data = await client.findById(req.params.id); // Find the client by its ID.
    res.render('inputs/updatingClient', { action: 'edit', data });
};

// Processes the submission to update an existing client, handling new logo uploads and validation.
module.exports.editClient = async (req, res) => {
    const { id } = req.params;
    const { name, website, description } = req.body;
    // Find and update the client details.
    const updatedClient = await client.findByIdAndUpdate(id, { name, website, description });
    // If a new logo was uploaded, update its Cloudinary URL and filename, and delete the old logo.
    if (req.file) {
        if (updatedClient.logo && updatedClient.logo.filename) {
            await cloudinary.uploader.destroy(updatedClient.logo.filename); // Delete old logo from Cloudinary.
        }
        updatedClient.logo = { url: req.file.path, filename: req.file.filename };
        await updatedClient.save(); // Save the updated client with the new logo.
    }
    res.redirect('/profile'); // Redirect to the profile page.
};

// --- Functions for Deleting Data ---

// Renders the page to select a contact to delete.
module.exports.renderDeleteContact = async (req, res) => {
    const data = await contact.find(); // Fetch all contacts to display for selection.
    res.render('inputs/updatingContact', { action: 'delete', data });
};

// Processes the request to delete a specific contact.
module.exports.deleteContact = async (req, res) => {
    const { id } = req.params;
    await contact.findByIdAndDelete(id); // Delete the contact from the database.
    res.redirect('/updating/contact/delete'); // Redirect back to the delete contact selection page.
};

// Renders the page to select a 'What I Do' item to delete.
module.exports.renderDeleteWhatDoIDo = async (req, res) => {
    const data = await whatDoIDo.find(); // Fetch all 'What I Do' items.
    res.render('inputs/updatingWhatdoIdo', { action: 'delete', data });
};

// Processes the request to delete a specific 'What I Do' item, including its icon from Cloudinary.
module.exports.deleteWhatDoIDo = async (req, res) => {
    const { id } = req.params;
    const deletedWhatDoIDo = await whatDoIDo.findByIdAndDelete(id); // Delete the item.
    // If an icon was associated, delete it from Cloudinary.
    if (deletedWhatDoIDo.icon && deletedWhatDoIDo.icon.filename) {
        await cloudinary.uploader.destroy(deletedWhatDoIDo.icon.filename);
    }
    res.redirect('/profile'); // Redirect to the profile page.
};

// Renders the page to select education details to delete.
module.exports.renderDeleteEducation = async (req, res) => {
    const data = await education.find(); // Fetch all education entries.
    res.render('inputs/updatingEducation', { action: 'delete', data });
};

// Processes the request to delete specific education details.
module.exports.deleteEducation = async (req, res) => {
    const { id } = req.params;
    await education.findByIdAndDelete(id); // Delete the education entry.
    res.redirect('/resume'); // Redirect to the resume page.
};

// Renders the page to select experience details to delete.
module.exports.renderDeleteExperience = async (req, res) => {
    const data = await experience.find(); // Fetch all experience entries.
    res.render('inputs/updatingExperience', { action: 'delete', data });
};

// Processes the request to delete specific experience details.
module.exports.deleteExperience = async (req, res) => {
    const { id } = req.params;
    await experience.findByIdAndDelete(id); // Delete the experience entry.
    res.redirect('/resume'); // Redirect to the resume page.
};

// Renders the page to select skill details to delete.
module.exports.renderDeleteSkill = async (req, res) => {
    const data = await skill.find(); // Fetch all skill entries.
    res.render('inputs/updatingSkills', { action: 'delete', data });
};

// Processes the request to delete specific skill details.
module.exports.deleteSkill = async (req, res) => {
    const { id } = req.params;
    await skill.findByIdAndDelete(id); // Delete the skill entry.
    res.redirect('/resume'); // Redirect to the resume page.
};

// Renders the page to select a project to delete.
module.exports.renderDeleteProject = async (req, res) => {
    const data = await project.find(); // Fetch all projects.
    res.render('inputs/updatingProject', { action: 'delete', data });
};

// Processes the request to delete a specific project, including its image from Cloudinary.
module.exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    const deletedProject = await project.findByIdAndDelete(id); // Delete the project.
    // If an image was associated, delete it from Cloudinary.
    if (deletedProject.image && deletedProject.image.filename) {
        await cloudinary.uploader.destroy(deletedProject.image.filename);
    }
    res.redirect('/portfolio'); // Redirect to the portfolio page.
};

// Renders the page to select a testimonial to delete.
module.exports.renderDeleteTestimonial = async (req, res) => {
    const data = await testimonial.find(); // Fetch all testimonials.
    res.render('inputs/updatingTestimonials', { action: 'delete', data });
};

// Processes the request to delete a specific testimonial, including its image from Cloudinary.
module.exports.deleteTestimonial = async (req, res) => {
    const { id } = req.params;
    const deletedTestimonial = await testimonial.findByIdAndDelete(id); // Delete the testimonial.
    // If an image was associated, delete it from Cloudinary.
    if (deletedTestimonial.image && deletedTestimonial.image.filename) {
        await cloudinary.uploader.destroy(deletedTestimonial.image.filename);
    }
    res.redirect('/profile'); // Redirect to the profile page.
};

// Renders the page to select a client to delete.
module.exports.renderDeleteClient = async (req, res) => {
    const data = await client.find(); // Fetch all clients.
    res.render('inputs/updatingClient', { action: 'delete', data });
};

// Processes the request to delete a specific client, including its logo from Cloudinary.
module.exports.deleteClient = async (req, res) => {
    const { id } = req.params;
    const deletedClient = await client.findByIdAndDelete(id); // Delete the client.
    // If a logo was associated, delete it from Cloudinary.
    if (deletedClient.logo && deletedClient.logo.filename) {
        await cloudinary.uploader.destroy(deletedClient.logo.filename);
    }
    res.redirect('/profile'); // Redirect to the profile page.
};

// We're making our file upload and image validation tools available for use in our routes.
module.exports.upload = upload;
module.exports.validateImageDimensions = validateImageDimensions;