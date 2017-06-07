require('dotenv').config({path: './config.env'});

const express = require('express');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const twilio_client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN); 
const moment = require('moment');
const nodemailer = require('nodemailer');


// Express App 
const app = express();

//Basic Express App Setup
app.use(bodyParser.urlencoded({extended: true}));
app.use('/static', express.static(__dirname + '/client'));

//Handlers
app.listen(process.env.PORT, () => {
    console.info('Listening on port ' + process.env.PORT);
});
//Route for handling web client - should be able to ditch it at some point!
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html')
});


