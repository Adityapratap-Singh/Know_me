const axios = require('axios');
require('dotenv').config();
const { getClientIp, getGeolocation } = require('./utils/geolocation');
const rateLimit = require('express-rate-limit');

module.exports.contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 contact requests per hour
    message: 'Too many contact requests from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports.isUpdatingVerified = (req, res, next) => {
    try {
        if (req.session.isUpdating) {
            return next();
        }
        res.redirect('/updating');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Session verification failed.' });
    }
};

module.exports.isContactViewingVerified = (req, res, next) => {
    try {
        if (req.session.isContactsVerified) {
            return next();
        }
        res.redirect('/verify-contacts');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Contacts verification failed.' });
    }
};

module.exports.sendVerificationCode = (purpose) => async (req, res, next) => {
    try {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        req.session.verificationCode = code;
        req.session.verificationPurpose = purpose;
        req.session.verificationTimestamp = Date.now();

        const botToken = process.env.VERIFICATION_TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (botToken && chatId) {
            const message = `Your verification code for ${purpose} is: ${code}`;
            await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                chat_id: chatId,
                text: message,
            });
        }

        const ip = getClientIp(req);
        
        const buildMessage = async () => {
            if (!ip) return `Verification initiated: ${purpose}\nIP: N/A`;
            
            const geo = await getGeolocation(ip);
            
            if (geo && geo.isLocal) {
                 return `Verification initiated: ${purpose}\nIP: ${ip} (Local Address)`;
            }

            if (geo && geo.lat && geo.lon) {
                const parts = [
                    `Verification initiated: ${purpose}`,
                    `IP: ${ip}`,
                    `Provider: ${geo.provider}`,
                    `Country: ${geo.country || 'N/A'}`,
                    `Region: ${geo.region || 'N/A'}`,
                    `City: ${geo.city || 'N/A'}`,
                    `ISP: ${geo.isp || 'N/A'}`,
                    `Latitude: ${geo.lat}`,
                    `Longitude: ${geo.lon}`
                ];
                return parts.join('\n');
            }
            return `Verification initiated: ${purpose}\nIP: ${ip}\nLocation unresolved`;
        };

        const botTokenGeo = process.env.TELEGRAM_BOT_TOKEN || process.env.VERIFICATION_TELEGRAM_BOT_TOKEN;
        if (botTokenGeo && chatId) {
            try {
                const text = await buildMessage();
                await axios.post(`https://api.telegram.org/bot${botTokenGeo}/sendMessage`, { chat_id: chatId, text });
            } catch {}
        }

        res.render('verification', { purpose });
    } catch (error) {
        console.error('Error sending verification code:', error);
        res.status(500).render('error', { message: 'Failed to send verification code.' });
    }
};

module.exports.verifyCode = (purpose) => (req, res, next) => {
    try {
        const { code } = req.body;
        const { verificationCode, verificationPurpose, verificationTimestamp } = req.session;

        if (
            code === verificationCode &&
            purpose === verificationPurpose &&
            Date.now() - verificationTimestamp < 5 * 60 * 1000 // 5 minutes
        ) {
            const ip = getClientIp(req);
            
            const buildMessage = async () => {
                if (!ip) return 'Access event. IP: N/A';
                
                const geo = await getGeolocation(ip);

                if (geo && geo.isLocal) {
                     return `Access event from local address. IP: ${ip}`;
                }

                if (geo && geo.lat && geo.lon) {
                    const parts = [
                        `IP: ${ip}`,
                        `Provider: ${geo.provider}`,
                        `Country: ${geo.country || 'N/A'}`,
                        `Region: ${geo.region || 'N/A'}`,
                        `City: ${geo.city || 'N/A'}`,
                        `ISP: ${geo.isp || 'N/A'}`,
                        `Latitude: ${geo.lat}`,
                        `Longitude: ${geo.lon}`
                    ];
                    return parts.join('\n');
                }
                return `IP: ${ip}\nLocation unresolved`;
            };
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID;
            const sendTelegram = async (prefix) => {
                try {
                    const details = await buildMessage();
                    const text = `${prefix}\n${details}`;
                    if (botToken && chatId) {
                        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, { chat_id: chatId, text });
                    }
                } catch {}
            };
            if (purpose === 'updating') {
                req.session.isUpdating = true;
                sendTelegram('Updating accessed');
                res.redirect('/updating/updatings');
            } else if (purpose === 'viewing contacts') {
                req.session.isContactsVerified = true;
                sendTelegram('Contacts viewed');
                res.redirect('/view-contacts');
            }
        } else {
            res.render('verification', { purpose, error: 'Invalid or expired verification code.' });
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).render('error', { message: 'Failed to verify code.' });
    }
};
