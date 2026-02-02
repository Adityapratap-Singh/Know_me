const axios = require('axios');
require('dotenv').config();
const { getClientIp, getGeolocation } = require('../utils/geolocation');
const catchAsync = require('../utils/catchAsync');
const siteConfig = require('../config/siteConfig');

// This file contains all the logic for rendering the main profile-related pages.
// It fetches necessary data from our database models and prepares it for display.

// We bring in all the necessary data models to interact with our database.
const whatDoIDo = require('../models/whatDoIDo');
const testimonial = require('../models/testimonials');
const education = require('../models/education');
const experience = require('../models/experience');
const skill = require('../models/skill');
const project = require('../models/project');
const client = require('../models/client'); // Our client data model
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

/**
 * Helper to serve the local resume file
 * @param {Object} res - Express response object
 */
const serveLocalResume = (res) => {
    const localResumePath = path.join(__dirname, '..', 'public', 'resume', 'Adityapratap_Singh_Resume.pdf');
    console.log('Serving local resume file from:', localResumePath);
    
    if (fs.existsSync(localResumePath)) {
         res.setHeader('Content-Disposition', 'attachment; filename="Adityapratap_Singh_Resume.pdf"');
         res.setHeader('Content-Type', 'application/pdf');
         const fileStream = fs.createReadStream(localResumePath);
         fileStream.pipe(res);
         fileStream.on('error', (err) => {
             console.error('Error serving local resume:', err);
             if (!res.headersSent) {
                 res.status(500).render('error', { message: 'Failed to download resume.' });
             }
         });
    } else {
         console.error('Local resume file not found.');
         if (!res.headersSent) {
             res.status(404).render('error', { message: 'Resume file not found.' });
         }
    }
};

/**
 * Helper to notify via Telegram about resume download
 * @param {string} ip - User IP
 */
const notifyResumeDownload = async (ip) => {
    try {
        let message;
        if (!ip) {
            message = 'Could not determine IP address.\nIP: N/A';
            console.log('IP address not found.');
        } else {
            const geo = await getGeolocation(ip);
            if (geo && geo.isLocal) {
                message = `Someone from a local address downloaded your resume.\nIP: ${ip}`;
                console.log('Local address detected.');
            } else if (geo) {
                message = `Someone downloaded your resume.\n` +
                    `IP: ${ip}\n` +
                    `Provider: ${geo.provider}\n` +
                    `Country: ${geo.country || 'N/A'}\n` +
                    `Region: ${geo.region || 'N/A'}\n` +
                    `City: ${geo.city || 'N/A'}\n` +
                    `ISP: ${geo.isp || 'N/A'}\n` +
                    `Coordinates: ${geo.lat}, ${geo.lon}`;
                console.log('Location determined:', geo.city, geo.country);
            } else {
                    message = `Someone downloaded your resume.\nIP: ${ip}\nLocation unresolved.`;
                    console.log('Location unresolved.');
            }
        }
        
        // Send Telegram notification
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.warn('[RESUME_NOTIFY] Telegram credentials missing. Skipping notification.');
            return;
        }

        if (message) {
            await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                chat_id: chatId,
                text: message
            }).catch(err => console.error(`[RESUME_NOTIFY_ERROR] Telegram API Error for IP ${ip}:`, err.message));
        }
    } catch (err) {
        console.error(`[RESUME_NOTIFY_ERROR] Critical error in geolocation/notification for IP ${ip}:`, err);
    }
};

// Redirects the user from the root path to the main profile page.
module.exports.homeRedirect = (req, res) => {
    res.redirect("/profile");
};

// Renders the main profile page, showing 'What I Do' items, testimonials, and client logos.
module.exports.renderProfile = catchAsync(async (req, res) => {
    const [Wid, testi, clients] = await Promise.all([
        whatDoIDo.find().lean().catch(() => []),
        testimonial.find().lean().catch(() => []),
        client.find().lean().catch(() => [])
    ]);
    const online = mongoose.connection && mongoose.connection.readyState === 1;
    
    const fallbackWid = [
        { title: 'Web Development', description: 'Building responsive and performant web applications.' },
        { title: 'UI/UX Design', description: 'Creating intuitive and accessible user interfaces.' }
    ];
    const fallbackTesti = [
        { name: 'John Doe', position: 'CEO, TechCorp', testimonial: 'An excellent developer who delivers on time.' },
        { name: 'Jane Smith', position: 'CTO, StartupInc', testimonial: 'Great problem solver and team player.' }
    ];

    res.render('profile/profile', {
        whatDoIDo: (Wid && Wid.length) ? Wid : fallbackWid,
        testimonials: (testi && testi.length) ? testi : fallbackTesti,
        clients: clients || [],
        currentPage: 'profile',
        dbOnline: online
    });
});

// Renders the resume page, displaying education, experience, and skills.
module.exports.renderResume = catchAsync(async (req, res) => {
    const [edu, exp, skl] = await Promise.all([
        education.find().lean().catch(() => []),
        experience.find().lean().catch(() => []),
        skill.find().lean().catch(() => [])
    ]);
    
    const fallbackEdu = [{ institution: 'University of Tech', degree: 'B.S. Computer Science', period: '2018-2022', description: 'Graduated with honors.' }];
    const fallbackExp = [{ company: 'Tech Solutions', position: 'Software Engineer', period: '2022-Present', description: 'Full stack development.' }];
    const fallbackSkl = [{ name: 'JavaScript', proficiency: 80 }, { name: 'Node.js', proficiency: 75 }];

    // Render the resume page with all the fetched data.
    res.render('profile/resume', { 
        education: (edu && edu.length) ? edu : fallbackEdu, 
        experience: (exp && exp.length) ? exp : fallbackExp, 
        skills: (skl && skl.length) ? skl : fallbackSkl, 
        currentPage: 'resume' 
    });
});

// Renders the portfolio page, showcasing various projects.
module.exports.renderPortfolio = catchAsync(async (req, res) => {
    // Fetch only visible project entries.
    const proj = await project.find({ $or: [ { isVisible: true }, { isVisible: { $exists: false } } ] }).lean().catch(() => []);
    
    const fallbackProj = [
        { title: 'Portfolio Site', category: 'Web', description: 'This website.', link: '#', image: { url: siteConfig.assets.fallbackProjectImage } }
    ];

    const projectsToRender = (proj && proj.length) ? proj : fallbackProj;

    // Extract unique categories from the fetched projects
    const uniqueCategories = [...new Set(projectsToRender.map(p => p.category))];
    // Render the portfolio page with the fetched project data and unique categories.
    res.render('profile/portfolio', { projects: projectsToRender, categories: uniqueCategories, currentPage: 'portfolio' });
});

// Renders the blog page.
module.exports.renderBlog = (req, res) => {
    res.render('profile/blog', { currentPage: 'blog' });
};

module.exports.downloadResume = catchAsync(async (req, res) => {
    const resumeUrl = process.env.resume_url;
    const ip = getClientIp(req);
    console.log('User IP:', ip);

    // Notify asynchronously - don't await to speed up response
    notifyResumeDownload(ip);

    if (!resumeUrl) {
        console.warn('resume_url environment variable is not set. Using local file.');
        return serveLocalResume(res);
    }

    const clientProto = resumeUrl.startsWith('https') ? https : http;

    // Stream the file
    res.setHeader('Content-Disposition', 'attachment; filename="Adityapratap_Singh_Resume.pdf"');
    const request = clientProto.get(resumeUrl, (fileRes) => {
        if (fileRes.statusCode >= 400) {
            console.warn(`Failed to fetch resume from URL (Status: ${fileRes.statusCode}). Falling back to local file.`);
            return serveLocalResume(res);
        }
        if (fileRes.headers['content-type']) {
            res.setHeader('Content-Type', fileRes.headers['content-type']);
        } else {
            res.setHeader('Content-Type', 'application/pdf');
        }
        fileRes.pipe(res);
    }).on('error', (err) => {
        console.error('Error fetching resume from URL:', err.message);
        console.log('Falling back to local file...');
        serveLocalResume(res);
    });
});
