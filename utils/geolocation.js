const axios = require('axios');

/**
 * Extract the client IP address from the request.
 * @param {Object} req - The Express request object.
 * @returns {string} - The extracted IP address.
 */
const getClientIp = (req) => {
    const forwarded = (req.headers['x-forwarded-for'] || 
                       req.headers['x-real-ip'] || 
                       req.headers['cf-connecting-ip'] || 
                       req.headers['fastly-client-ip'] || 
                       req.headers['true-client-ip'] || 
                       '').toString();
    let ip = forwarded.split(',')[0].trim() || req.socket.remoteAddress || req.connection.remoteAddress;
    if (ip && ip.startsWith('::ffff:')) ip = ip.substring(7);
    return ip;
};

/**
 * Get geolocation data for a given IP address using multiple providers as fallbacks.
 * @param {string} ip - The IP address to lookup.
 * @returns {Promise<Object|null>} - The geolocation data or null if not found.
 */
const getGeolocation = async (ip) => {
    if (!ip) return null;
    if (ip === '::1' || ip === '127.0.0.1') {
        return { isLocal: true, ip };
    }

    // Provider 1: ipgeolocation.io
    const geoFromIpgeolocation = async (p) => {
        const key = process.env.ipgeolocation;
        if (!key) return null;
        try {
            const r = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${key}&ip=${p}`, { timeout: 3000 });
            const d = r.data;
            const lat = d && (d.latitude ? parseFloat(d.latitude) : (d.location && d.location.latitude ? parseFloat(d.location.latitude) : null));
            const lon = d && (d.longitude ? parseFloat(d.longitude) : (d.location && d.location.longitude ? parseFloat(d.location.longitude) : null));
            if (lat !== null && lon !== null) {
                return { lat, lon, country: d.country_name || d.country || '', region: d.state_prov || d.state || '', city: d.city || '', isp: d.isp || d.organization || '', provider: 'ipgeolocation.io' };
            }
        } catch (e) { /* ignore */ }
        return null;
    };

    // Provider 2: ip-api.com
    const geoFromIpApi = async (p) => {
        try {
            const r = await axios.get(`http://ip-api.com/json/${p}`, { timeout: 3000 });
            const d = r.data;
            if (d && d.status === 'success') {
                return { lat: d.lat, lon: d.lon, country: d.country, region: d.regionName, city: d.city, isp: d.isp, provider: 'ip-api.com' };
            }
        } catch (e) { /* ignore */ }
        return null;
    };

    // Provider 3: ipapi.co
    const geoFromIpapiCo = async (p) => {
        try {
            const r = await axios.get(`https://ipapi.co/${p}/json/`, { timeout: 3000 });
            const d = r.data;
            if (d && d.latitude && d.longitude) {
                return { lat: d.latitude, lon: d.longitude, country: d.country_name || d.country, region: d.region, city: d.city, isp: d.org || d.asn || '', provider: 'ipapi.co' };
            }
        } catch (e) { /* ignore */ }
        return null;
    };

    // Provider 4: ipinfo.io
    const geoFromIpinfo = async (p) => {
        try {
            const r = await axios.get(`https://ipinfo.io/${p}/json`, { timeout: 3000 });
            const d = r.data;
            if (d && d.loc) {
                const parts = d.loc.split(',');
                return { lat: parseFloat(parts[0]), lon: parseFloat(parts[1]), country: d.country || '', region: d.region || '', city: d.city || '', isp: d.org || '', provider: 'ipinfo.io' };
            }
        } catch (e) { /* ignore */ }
        return null;
    };

     // Provider 5: iplocation.net (Scraping fallback)
     const geoFromIplocationPage = async (p) => {
        const urls = [
            `https://www.iplocation.net/ip-lookup?query=${p}`,
            `https://www.iplocation.net/ip-lookup?ip=${p}`,
            `https://www.iplocation.net/?lookup=${p}`
        ];
        for (const u of urls) {
            try {
                const html = (await axios.get(u, { timeout: 5000 })).data || '';
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
            } catch (e) { /* ignore */ }
        }
        return null;
    };

    let geo = await geoFromIpgeolocation(ip);
    if (!geo) geo = await geoFromIpApi(ip);
    if (!geo) geo = await geoFromIpapiCo(ip);
    if (!geo) geo = await geoFromIpinfo(ip);
    if (!geo) geo = await geoFromIplocationPage(ip);

    return geo;
};

module.exports = {
    getClientIp,
    getGeolocation
};
