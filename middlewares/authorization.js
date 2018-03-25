// Unprotected routes
let whitelist = [
    '/auth/login',
    '/auth/validatesession',
    '/auth/register',
    '/auth/initiatepassreset',
    '/auth/resetpass'
];

module.exports = (req, res, next) => {
    // Pre-Flight OPTIONS Request
    if (req.method == 'OPTIONS') return res.send({ message: 'Preflight check successful' });

    // Parse the token
    if (req.headers.authorization) {
        token = req.headers.authorization.split('Bearer ')[1];
        req.token = token;
    }
    // Checks to see if the route is a non-protected route
    if (whitelist.indexOf(req.url) != -1) return next();

    if (!req.headers.authorization) {
        return res.send({
            status: req.app.locals.statusCodes.unauthorized,
            message: "Not Authenticated."
        })
    }
    // Tries to validate a token
    try {
        // Check for a session using that token
        return req.app.locals._authService.validateTokenSession(req, token, (session) => {
            // Checks to see if  user is active
            if (session.user.hasOwnProperty('active') && session.user.active) {
                if (session.isLoggedIn) {
                    req.user = session.user || [];
                    req.user.token = token;
                    next();
                } else {
                    res.send({ status: req.app.locals.statusCodes.unauthorized, message: 'Not Authorized' });
                }
            } else {
                return res.send({
                    status: req.app.locals.statusCodes.unauthorized,
                    message: session.user.hasOwnProperty('active') ? "You account is deactivated." : " Not Authorized"
                });
            }
        });

    } catch (err) {
        // This assumes an error occured or no authorization header was present on the request
        return res.send({ status: req.app.locals.statusCodes.unauthorized, error: err.message });
    }
}

// We could just check for a valid session here and not worry about whitelisted routes yet. 
// In that case we would add middleware for whitelisted routes within the route controller files themselves