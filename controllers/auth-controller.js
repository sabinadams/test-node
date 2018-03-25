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

router.post('/register', (req, res) => {
    req.app.locals._authService.register(req.body, resp => {
        res.send({
            status: resp.success ? req.app.locals.statusCodes.success : req.app.locals.statusCodes.unauthorized,
            valid: resp.success ? true : false,
            message: resp.message,
            user: resp.user
        });
    });
});

router.post('/initiatepassreset', (req, res) => {
    req.app.locals._authService.forgotPasswordEmail(req.body.email, response => {
        res.send({
            status: response.success ? req.app.locals.statusCodes.success : req.app.locals.statusCodes.unauthorized,
            valid: response.success ? true : false,
            message: response.message
        });
    });
});

router.post('/resetpass', (req, res) => {
    req.app.locals._authService.forgotPasswordChangePass(req.body.code, req.body.data, response => {
        res.send({
            status: response.success ? req.app.locals.statusCodes.success : req.app.locals.statusCodes.unauthorized,
            valid: response.success ? true : false,
            message: response.message,
            timetaken: response.timetaken
        })
    })
})
module.exports = router;