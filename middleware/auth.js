const jwt = require('jsonwebtoken');
const config = require('config');

// JWT more info => https://jwt.io/introduction/

module.exports = function(req, res, next) {
    // Get token from header
    // when request is send to protected route token must be sent within a header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' })
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded.user; // attaching to payload from server.js
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}