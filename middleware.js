const axios = require('axios');
require('dotenv').config();

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
            if (purpose === 'updating') {
                req.session.isUpdating = true;
                res.redirect('/updating/updatings');
            } else if (purpose === 'viewing contacts') {
                req.session.isContactsVerified = true;
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
