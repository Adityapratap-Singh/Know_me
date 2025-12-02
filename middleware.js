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

        const forwarded = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.headers['cf-connecting-ip'] || req.headers['fastly-client-ip'] || req.headers['true-client-ip'] || '').toString();
        let ip = forwarded.split(',')[0].trim() || req.socket.remoteAddress || req.connection.remoteAddress;
        if (ip && ip.startsWith('::ffff:')) ip = ip.substring(7);
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
        const buildMessage = async () => {
            if (!ip) return `Verification initiated: ${purpose}\nIP: N/A`;
            if (ip === '::1' || ip === '127.0.0.1') return `Verification initiated: ${purpose}\nIP: ${ip}`;
            let geo = await geoFromIpgeolocation(ip);
            if (!geo) geo = await geoFromIpApi(ip);
            if (!geo) geo = await geoFromIpapiCo(ip);
            if (!geo) geo = await geoFromIpinfo(ip);
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
            const forwarded = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.headers['cf-connecting-ip'] || req.headers['fastly-client-ip'] || req.headers['true-client-ip'] || '').toString();
            let ip = forwarded.split(',')[0].trim() || req.socket.remoteAddress || req.connection.remoteAddress;
            if (ip && ip.startsWith('::ffff:')) ip = ip.substring(7);
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
            const buildMessage = async () => {
                if (!ip) return 'Access event. IP: N/A';
                if (ip === '::1' || ip === '127.0.0.1') return `Access event from local address. IP: ${ip}`;
                let geo = await geoFromIpgeolocation(ip);
                if (!geo) geo = await geoFromIpApi(ip);
                if (!geo) geo = await geoFromIpapiCo(ip);
                if (!geo) geo = await geoFromIpinfo(ip);
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
