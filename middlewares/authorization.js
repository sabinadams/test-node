var _authService = require('../services/auth-service');
var db = require('../models');
_authService = new _authService(db);
// Unprotected routes
let whitelist = [
    /* Array of strings with the endpoints
       Example: 
            '/route',
            '/anotherRoute',
            '/thirdRoute
    */
    '/auth/login'
];

module.exports = (req, res, next) => {
    // Pre-Flight OPTIONS Request
    if (req.method == 'OPTIONS') return res.send({ message: 'Preflight check successful' });

    // Parse the token
    if (req.headers.authorization) {
        token = req.headers.authorization.split('bearer ')[1];
        req.token = token;
    } else {
        return res.send({
            status: 401,
            message: "Not Authenticated."
        })
    }
    // Checks to see if the route is a non-protected route
    if (whitelist.indexOf(req.url) != -1) return next();

    // Tries to validate a token
    try {

        // Check for a session using that token
        return _authService.validateTokenSession(req, token, (session) => {
            // Checks to see if 

            if (session.user.hasOwnProperty('active') && session.user.active) {
                if (session.isLoggedIn) {
                    req.user = session.user || [];
                    req.user.token = token;
                    next();
                } else {
                    res.send({ status: 401, message: 'Not Authorized' });
                }
            } else {
                return res.send({
                    status: 401,
                    message: session.user.hasOwnProperty('active') ? "You account is deactivated." : " Not Authorized"
                });
            }
        });

        res.send({
            status: req.app.locals.statusCodes.success,
            message: "This is a fake success message."
        });

    } catch (err) {
        // This assumes an error occured or no authorization header was present on the request
        return res.send({ status: req.app.locals.statusCodes.unauthorized, message: `There was either a problem or you are not authorized to access this endpoint.`, error: err.message });
    }
}

// We could just check for a valid session here and not worry about whitelisted routes yet. 
// In that case we would add middleware for whitelisted routes within the route controller files themselves