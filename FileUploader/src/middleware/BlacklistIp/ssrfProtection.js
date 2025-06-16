const getClientIP = require('../../services/getClientIp');
const errorHandler = require('../error');
const ipBlacklist = require('./ipBlacklist');

const ssrfProtection = async (req, res, next) => {
    let clIp = await getClientIP(req.headers)
    // if(!clIp && process.env.NODE_ENV !== 'development'){
    //     return errorHandler({
    //         message: `Access Denied`,
    //     }, req, res, next, 401)
    // }

    const clientIP = clIp || req.ip || req.connection.remoteAddress;
    
    // Check if IP is already blacklisted
    // if (ipBlacklist.isBlacklisted(clientIP)) {
    //     return res.status(403).json({
    //         error: `Request not allowed.`
    //     });
    // }

    // Check for potential SSRF attack patterns
    const suspiciousPatterns = [
        /^127\./,
        /^192\.168\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^0\./,
        /^localhost/,
        /^::1/,
        /^fc00::/,
        /^fe80::/
    ];

    // Check URL parameters and body for suspicious patterns
    const checkForSSRF = (obj) => {
        if (!obj) return false;
        
        for (const key in obj) {
            const value = obj[key];
            if (typeof value === 'string') {
                for (const pattern of suspiciousPatterns) {
                    if (pattern.test(value)) {
                        return true;
                    }
                }
            } else if (typeof value === 'object') {
                if (checkForSSRF(value)) return true;
            }
        }
        return false;
    };

    // Check request body, query parameters, and URL parameters
    // if (checkForSSRF(req.body) || checkForSSRF([clientIP]) || checkForSSRF(req.query) || checkForSSRF(req.params)) {
    //     console.log('ssrfProtection')
    //     // Add IP to blacklist
    //     ipBlacklist.addToBlacklist(clientIP);
    //     return res.status(403).json({
    //         error: `Request blocked.`
    //     });
    // }

    next();
};

module.exports = ssrfProtection; 
