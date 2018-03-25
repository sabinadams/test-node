// Main routing file that gathers all the controller files and exports them to the index.js file
const express = require('express'),
    router = express.Router();
let db = require("../models");

// Gathers all the route controller files and defines their usage
router.use('/auth', require('./auth-controller'));
router.use('/markers', require('./marker-controller'));
module.exports = router;