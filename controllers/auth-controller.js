const express = require('express'),
    router = express.Router();

router.post('/validatesession', (req, res) => {
    req.app.locals._authService.validateTokenSession(req, req.body.token, (session) => {
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

router.post('/update', (req, res) => {
    req.app.locals._authService.updateUser(req.user, req.body, ret => {
        res.send({
            status: ret.success ? req.app.locals.statusCodes.success : req.app.locals.statusCodes.unauthorized,
            userdata: ret.new_user,
            valid: ret.success ? true : false,
            message: ret.message
        });
    });
})

module.exports = router;