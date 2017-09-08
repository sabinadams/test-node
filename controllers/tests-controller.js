const express = require('express'),
    router = express.Router();

router.get('/test', (req, res) => {
    res.send({
        status: 200,
        message: 'Login'
    });
});


module.exports = router;