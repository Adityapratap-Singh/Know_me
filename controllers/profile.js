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
        // Fetch only visible project entries.
        const proj = await project.find({ $or: [ { isVisible: true }, { isVisible: { $exists: false } } ] }).lean().catch(() => []);
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
                message = 'Could not determine IP address.\nIP: N/A';
                console.log('IP address not found.');
            } else if (ip === '::1' || ip === '127.0.0.1') {
                message = `Someone from a local address downloaded your resume.\nIP: ${ip}`;
                console.log('Local address detected.');
            } else {
                const geoFromIpgeolocation = async (p) => {
                    const key = process.env.ipgeolocation;
                    if (!key) return null;
                    try {
                        const r = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${key}&ip=${p}`);
                        const d = r.data;
                        const lat = d && (d.latitude ? parseFloat(d.latitude) : (d.location && d.location.latitude ? parseFloat(d.location.latitude) : null));
                        const lon = d && (d.longitude ? parseFloat(d.longitude) : (d.location && d.location.longitude ? parseFloat(d.location.longitude) : null));
                        if (lat !== null && lon !== null) {
                            return { lat, lon, country: d.country_name || d.country || '', region: d.state_prov || d.state || '', city: d.city || '', isp: d.isp || d.organization || '', provider: 'ipgeolocation.io' };
                        }
                    } catch {}
                    return null;
                };
                const geoFromIpApi = async (p) => {
                    try {
                        const r = await axios.get(`http://ip-api.com/json/${p}`);
                        const d = r.data;
                        if (d && d.status === 'success') {
                            return { lat: d.lat, lon: d.lon, country: d.country, region: d.regionName, city: d.city, isp: d.isp, provider: 'ip-api.com' };
                        }
                    } catch {}
                    return null;
                };
                const geoFromIpapiCo = async (p) => {
                    try {
                        const r = await axios.get(`https://ipapi.co/${p}/json/`);
                        const d = r.data;
                        if (d && d.latitude && d.longitude) {
                            return { lat: d.latitude, lon: d.longitude, country: d.country_name || d.country, region: d.region, city: d.city, isp: d.org || d.asn || '', provider: 'ipapi.co' };
                        }
                    } catch {}
                    return null;
                };
                const geoFromIplocationPage = async (p) => {
                    const urls = [
                        `https://www.iplocation.net/ip-lookup?query=${p}`,
                        `https://www.iplocation.net/ip-lookup?ip=${p}`,
                        `https://www.iplocation.net/?lookup=${p}`
                    ];
                    for (const u of urls) {
                        try {
                            const html = (await axios.get(u)).data || '';
                            const latMatch = html.match(/Latitude:\s*([0-9.]+)/i);
                            const lonMatch = html.match(/Longitude:\s*([0-9.]+)/i);
                            if (latMatch && lonMatch) {
                                const countryMatch = html.match(/Country:\s*([^<\n]+)/i);
                                const regionMatch = html.match(/Region:\s*([^<\n]+)/i);
                                const cityMatch = html.match(/City:\s*([^<\n]+)/i);
                                const ispMatch = html.match(/ISP:\s*([^<\n]+)/i);
                                return {
                                    lat: parseFloat(latMatch[1]),
                                    lon: parseFloat(lonMatch[1]),
                                    country: countryMatch ? countryMatch[1].trim() : '',
                                    region: regionMatch ? regionMatch[1].trim() : '',
                                    city: cityMatch ? cityMatch[1].trim() : '',
                                    isp: ispMatch ? ispMatch[1].trim() : '',
                                    provider: 'iplocation.net'
                                };
                            }
                        } catch {}
                    }
                    return null;
                };
                const geoFromIpinfo = async (p) => {
                    try {
                        const r = await axios.get(`https://ipinfo.io/${p}/json`);
                        const d = r.data;
                        if (d && d.loc) {
                            const parts = d.loc.split(',');
                            return { lat: parseFloat(parts[0]), lon: parseFloat(parts[1]), country: d.country || '', region: d.region || '', city: d.city || '', isp: d.org || '', provider: 'ipinfo.io' };
                        }
                    } catch {}
                    return null;
                };
                let geo = await geoFromIpgeolocation(ip);
                if (!geo) geo = await geoFromIpApi(ip);
                if (!geo) geo = await geoFromIpapiCo(ip);
                if (!geo) geo = await geoFromIplocationPage(ip);
                if (!geo) geo = await geoFromIpinfo(ip);
                if (geo && geo.lat && geo.lon) {
                    const parts = [
                        `Resume downloaded`,
                        `IP: ${ip}`,
                        `Provider: ${geo.provider}`,
                        `Country: ${geo.country || 'N/A'}`,
                        `Region: ${geo.region || 'N/A'}`,
                        `City: ${geo.city || 'N/A'}`,
                        `ISP: ${geo.isp || 'N/A'}`,
                        `Latitude: ${geo.lat}`,
                        `Longitude: ${geo.lon}`
                    ];
                    message = parts.join('\n');
                } else {
                    message = `Resume downloaded. Unable to resolve precise location for IP ${ip}.`;
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
