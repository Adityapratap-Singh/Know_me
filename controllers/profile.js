// This file contains all the logic for rendering the main profile-related pages.
// It fetches necessary data from our database models and prepares it for display.

// We bring in all the necessary data models to interact with our database.
const whatDoIDo = require('../models/whatDoIDo');
const testimonial = require('../models/testimonials');
const education = require('../models/education');
const experience = require('../models/experience');
const skill = require('../models/skill');
const project = require('../models/project');
const client = require('..//models/client'); // Our client data model

// Redirects the user from the root path to the main profile page.
module.exports.homeRedirect = (req, res) => {
    res.redirect("/profile");
};

// Renders the main profile page, showing 'What I Do' items, testimonials, and client logos.
module.exports.renderProfile = async (req, res) => {
    try {
        // Fetch all 'What I Do' entries.
        const Wid = await whatDoIDo.find();
        // Fetch all testimonials.
        const testi = await testimonial.find();
        // Fetch all client logos and details.
        const clients = await client.find();
        // Render the profile page with all the fetched data.
        res.render('profile/profile', { whatDoIDo: Wid, testimonials: testi, clients: clients, currentPage: 'profile' });
    } catch (err) {
        // If something goes wrong, we send an error message.
        res.status(500).send(err.message);
    }
};

// Renders the resume page, displaying education, experience, and skills.
module.exports.renderResume = async (req, res) => {
    try {
        // Fetch all education entries.
        const edu = await education.find();
        // Fetch all experience entries.
        const exp = await experience.find();
        // Fetch all skill entries.
        const skl = await skill.find();
        // Render the resume page with all the fetched data.
        res.render('profile/resume', { education: edu, experience: exp, skills: skl, currentPage: 'resume' });
    } catch (err) {
        // If something goes wrong, we send an error message.
        res.status(500).send(err.message);
    }
};

// Renders the portfolio page, showcasing various projects.
module.exports.renderPortfolio = async (req, res) => {
    try {
        // Fetch all project entries.
        const proj = await project.find();
        // Render the portfolio page with the fetched project data.
        res.render('profile/portfolio', { projects: proj, currentPage: 'portfolio' });
    } catch (err) {
        // If something goes wrong, we send an error message.
        res.status(500).send(err.message);
    }
};

// Renders the blog page.
module.exports.renderBlog = (req, res) => {
    res.render('profile/blog', { currentPage: 'blog' });
};