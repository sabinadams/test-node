const express = require('express'),
    app = express(),
    parser = require('body-parser'),
    router = require('./controllers/index'),
    authorization = require('./middlewares/authorization'),
    constants = require('./config/CONSTANTS'),
    authService = require('./services/auth-service'),
    markerService = require('./services/marker-service'),
    db = require('./models');

// Setting up application scope variables
app.locals.statusCodes = constants.status_responses;
app.locals.env = process.env.NODE_ENV || "development";
app.locals._authService = new authService(db);
app.locals._markerService = new markerService(db);

// Parsing request/response data
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

//CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Application-level middleware
app.use(authorization);

// Route Initialization
app.use(router);

// Specifies which port to run the server on.
app.listen(6969, () => {
    console.log('Example app listening on port 6969!');
});