const express = require('express'),
    router = express.Router();
router.post('/login', (req, res) => {
    req.app.locals._authService.login(req.body.email, req.body.password, req.token, user_data => {
        res.send({
            status: 200,
            message: 'Login',
            userdata: user_data
        });
    });

});


module.exports = router;