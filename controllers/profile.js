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
const mongoose = require('mongoose');

// Redirects the user from the root path to the main profile page.
module.exports.homeRedirect = (req, res) => {
    try {
        res.redirect("/profile");
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to redirect to profile page.' });
    }
};

// Renders the main profile page, showing 'What I Do' items, testimonials, and client logos.
module.exports.renderProfile = async (req, res) => {
    try {
        const [Wid, testi, clients] = await Promise.all([
            whatDoIDo.find().lean().catch(() => []),
            testimonial.find().lean().catch(() => []),
            client.find().lean().catch(() => [])
        ]);
        const online = mongoose.connection && mongoose.connection.readyState === 1;
        const fallbackWid = [
            { title: 'Web Development', description: 'Responsive websites and APIs.' },
            { title: 'UI/UX Design', description: 'Clean, accessible interfaces.' }
        ];
        const fallbackTesti = [
            { name: 'Happy Client', position: 'Founder', testimonial: 'Professional and reliable delivery.' },
            { name: 'Project Lead', position: 'Manager', testimonial: 'Strong problem-solving and ownership.' }
        ];
        res.render('profile/profile', {
            whatDoIDo: Wid && Wid.length ? Wid : (online ? Wid : fallbackWid),
            testimonials: testi && testi.length ? testi : (online ? testi : fallbackTesti),
            clients: clients || [],
            currentPage: 'profile',
            dbOnline: online
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load profile data.' });
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
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load resume data.' });
    }
};

// Renders the portfolio page, showcasing various projects.
module.exports.renderPortfolio = async (req, res) => {
    try {
        // Fetch all project entries.
        const proj = await project.find();
        // Extract unique categories from the fetched projects
        const uniqueCategories = [...new Set(proj.map(p => p.category))];
        // Render the portfolio page with the fetched project data and unique categories.
        res.render('profile/portfolio', { projects: proj, categories: uniqueCategories, currentPage: 'portfolio' });
    } catch (err) {
        // If something goes wrong, we send an error message.
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load portfolio data.' });
    }
};

// Renders the blog page.
module.exports.renderBlog = (req, res) => {
    try {
        res.render('profile/blog', { currentPage: 'blog' });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load blog page.' });
    }
};
