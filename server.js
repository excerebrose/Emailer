require('dotenv').config({path: './config.env'});

const express = require('express');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const twilio_client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN); 
const moment = require('moment');

let db = null;
const app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use('/static', express.static(__dirname + '/client'));


sendAsSms = (emailObject) => {
    const formatted_date = moment(emailObject.date).format('ddd, MMM Do YYYY, h:m A');
    let attachmentString = 'None';
    if (emailObject.attachments.length > 0)
        attachmentString = emailObject.attachments.join (" ");

    const smsbody = `New email from:${emailObject.from}, at ${formatted_date}.\nSub: ${emailObject.subject}\nMessage: ${emailObject.message}\nAttachments: ${attachmentString}`;
    
    twilio_client.messages.create({ 
        to: process.env.PHONE_NUMBER, 
        from: process.env.TWILIO_NUMBER, 
        body: smsbody, 
    }, function(err, message) {
        if(err) 
            console.log("Error sending SMS:" + err);
    });
}

mongoose.connect(process.env.DB_URL);

db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//Mongo Model Schemas
const EmailSchema = mongoose.Schema({
    from: String,
    name: String,
    date: Date,
    subject: String,
    message: String,
    attachments: [String],
});

//Mongo Models
let Email = mongoose.model('Emails', EmailSchema);


//Handlers
db.once('open', function() {
    console.log("Connection to DB Establish");
    app.listen(process.env.PORT, () => {
        console.info('Listening on port ' + process.env.PORT);
    });
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/client/index.html')
    });
    app.post('/new-email', (req, res) => {
        new Email(req.body)
        .save((err, res) => {
            if(err)
                console.log("Save Failed:" + err);
            else
                sendAsSms(res);
        })
        res.redirect('/');
    });
});



