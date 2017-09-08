const express = require('express'),
    app = express(),
    parser = require('body-parser'),
    router = require('./controllers/index'),
    authorization = require('./middlewares/authorization'),
    constants = require('./config/CONSTANTS'),
    testService = require('./services/test-service');


// Setting up application scope variables
app.locals.statusCodes = constants.status_responses;
app.locals.testService = new testService();

// Parsing request/response data
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use('/views', express.static(__dirname + '/views'));
// // Application-level middleware
// app.use(authorization);

// Route Initialization
app.use(router);

app.get('/', (req, res) => {
    // res.send('hello world');
    res.sendFile(`${__dirname}/views/client.html`);
});

// Specifies which port to run the server on.
app.listen(6969, () => {
    console.log('Example app listening on port 6969!');
});