const express = require('express'),
    app = express(),
    parser = require('body-parser'),
    router = require('./controllers/index'),
    authorization = require('./middlewares/authorization'),
    constants = require('./config/CONSTANTS'),
    authService = require('./services/auth-service'),
    Sequelize = require("sequelize"),
    config = require('./config/CONSTANTS'),
    db = require('./models');


// Setting up application scope variables
app.locals.statusCodes = constants.status_responses;
app.locals.env = process.env.NODE_ENV || "development";

app.locals._authService = new authService(db);

// Parsing request/response data
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

// Application-level middleware
app.use(authorization);

// Route Initialization
app.use(router);

// Specifies which port to run the server on.
app.listen(6969, () => {
    console.log('Example app listening on port 6969!');
});