const express = require('express'),
    router = express.Router();

router.post('/new', (req, res) => {
    req.app.locals._markerService.newMarker(req.user, req.body, ret => {
        res.send({
            status: ret.success ? req.app.locals.statusCodes.success : req.app.locals.statusCodes.failure,
            message: ret.success ? "Marker created" : ret.message,
            valid: ret.success,
            marker: ret.marker
        });
    });
});

router.get('/', (req, res) => {
    req.app.locals._markerService.getMarkers(req.user, ret => {
        res.send({
            status: ret.success ? req.app.locals.statusCodes.success : req.app.locals.statusCodes.failure,
            markers: ret.markers,
            valid: ret.success
        })
    });
});

router.post('/delete', (req, res) => {
    req.app.locals._markerService.deleteMarker(req.user, req.body.ID, ret => {
        res.send({
            status: ret.success ? req.app.locals.statusCodes.success : req.app.locals.statusCodes.failure,
            message: ret.message,
            valid: ret.success
        })
    });
})

router.post('/send', (req, res) => {
    req.app.locals._markerService.sendToUser(req.user.ID, req.body.tag, req.body.marker, resp => {
        res.send({
            status: resp.success ? req.app.locals.statusCodes.success : req.app.locals.statusCodes.failure,
            message: resp.message,
            valid: resp.success
        });
    });
})
module.exports = router;