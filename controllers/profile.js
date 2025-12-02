const axios = require('axios');
require('dotenv').config();
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
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

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

module.exports.downloadResume = async (req, res) => {
    try {
        const resumeUrl = process.env.resume_url;
        const clientProto = resumeUrl.startsWith('https') ? https : http;

        const forwarded = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.headers['cf-connecting-ip'] || req.headers['fastly-client-ip'] || req.headers['true-client-ip'] || '').toString();
        let ip = forwarded.split(',')[0].trim() || req.socket.remoteAddress || req.connection.remoteAddress;
        if (ip && ip.startsWith('::ffff:')) ip = ip.substring(7);
        console.log('User IP:', ip);

        // Get location from IP address
        try {
            let message;
            if (!ip) {
                message = 'Could not determine IP address.';
                console.log('IP address not found.');
            } else if (ip === '::1' || ip === '127.0.0.1') {
                message = 'Someone from a local address downloaded your resume.';
                console.log('Local address detected.');
            } else {
                try {
                    console.log('Trying ip-api.com...');
                    const locationResponse = await axios.get(`http://ip-api.com/json/${ip}`);
                    console.log('ip-api.com response:', locationResponse.data);
                    const location = locationResponse.data;
                    if (location.status === 'success') {
                        const mapUrl = `https://www.google.com/maps?q=${location.lat},${location.lon}`;
                        message = `Someone downloaded your resume. Location: ${mapUrl}`;
                    } else {
                        throw new Error('ip-api.com failed');
                    }
                } catch (error) {
                    console.error('ip-api.com error:', error.message);
                    try {
                        console.log('Trying ipapi.co...');
                        const locationResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
                        console.log('ipapi.co response:', locationResponse.data);
                        const location = locationResponse.data;
                        const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                        message = `Someone downloaded your resume. Location: ${mapUrl}`;
                    } catch (error) {
                        console.error('ipapi.co error:', error.message);
                        try {
                            console.log('Trying freegeoip.app...');
                            const locationResponse = await axios.get(`https://freegeoip.app/json/${ip}`);
                            console.log('freegeoip.app response:', locationResponse.data);
                            const location = locationResponse.data;
                            const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                            message = `Someone downloaded your resume. Location: ${mapUrl}`;
                        } catch (error) {
                            console.error('freegeoip.app error:', error.message);
                            message = 'Someone from an unknown location downloaded your resume.';
                        }
                    }
                }
            }

            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID;
            if (botToken && chatId && message) {
                try {
                    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        chat_id: chatId,
                        text: message,
                    });
                } catch (e) {
                    console.error('Failed to send Telegram message:', e.message);
                }
            } else {
                console.log('Telegram message:', message);
            }
        } catch (error) {
            console.error('Error getting location or sending Telegram message:', error);
        }

        res.setHeader('Content-Disposition', 'attachment; filename="Adityapratap_Singh_Resume.pdf"');
        clientProto.get(resumeUrl, (fileRes) => {
            if (fileRes.statusCode >= 400) {
                return res.status(502).render('error', { message: 'Failed to fetch resume file.' });
            }
            if (fileRes.headers['content-type']) {
                res.setHeader('Content-Type', fileRes.headers['content-type']);
            } else {
                res.setHeader('Content-Type', 'application/pdf');
            }
            fileRes.pipe(res);
        }).on('error', (err) => {
            console.error(err);
            res.status(500).render('error', { message: 'Failed to download resume.' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to download resume.' });
    }
};
