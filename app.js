// Require express and create an instance of it

const campaignRoute = require('./routes/campaignRoutes');
const path = require('path')
var express = require('express');
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './static/')));
// on the request to root
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, './static/index.html'));
});

// campaign routes
app.get('/campaigns-status', campaignRoute);
app.get('/campaigns', campaignRoute);

app.use(function(req, res, next) {
    res.status(404).send("Not found");
});

// start the server
app.listen(3000, function () {
    console.log('Web Server is started on port 3000.');
});

//catch uncaught exceptions 
process.on('uncaughtException', function(err) { 
    console.log( " UNCAUGHT EXCEPTION " );
    console.log( "[Inside 'uncaughtException' event] " + err.stack || err.message );
})
