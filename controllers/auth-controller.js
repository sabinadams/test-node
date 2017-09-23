const express = require('express'),
    router = express.Router();

router.post('/validatesession', (req, res) => {
    req.app.locals._authService.validateTokenSession(req, req.body.token, (session) => {
        console.log(session);
        res.send({
            status: 200,
            valid: session.isLoggedIn ? true : false
        });
    });
});
router.post('/login', (req, res) => {
    req.app.locals._authService.login(req.body.email, req.body.password, req.body.token, user_data => {
        res.send({
            status: user_data.logged_in ? req.app.locals.statusCodes.success : req.app.locals.statusCodes.unauthorized,
            userdata: user_data
        });
    });

});


module.exports = router;