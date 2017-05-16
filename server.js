require('dotenv').config({path: './config.env'});

const express = require('express');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const twilio_client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN); 
const moment = require('moment');

//Global Variable Declarations
let db = null;
const app = express();

//Basic Express App Setup
app.use(bodyParser.urlencoded({extended: true}));
app.use('/static', express.static(__dirname + '/client'));

// Functions to do interaction with Twilio Client
sendSMS = (smsbody) => {
     twilio_client.messages.create({ 
        to: process.env.PHONE_NUMBER, 
        from: process.env.TWILIO_NUMBER, 
        body: smsbody, 
    }, 
    (err, message) => {
        if(err) 
            console.log("Error sending SMS:" + err);
    });
}

sendEmail = (emailObject) => {
    //Code to send Email and onSuccess call sendSMS with (Sent!)
}

parseToSMS = (emailObject) => {
    const maxChars = 1500; //Changed to 1500 because of Twilio's injection into free accounts - move it up to 1600 later'
    const continueMsg = "\nContinued in Next SMS. - Number ";

    const formattedDate = moment(emailObject.date).format('ddd, MMM Do YYYY, h:m A');
    let attachmentString = 'None';
    if (emailObject.attachments.length > 0)
        attachmentString = emailObject.attachments.join (" ");
    const smsBodyHeader = `New email from:${emailObject.from}, at ${formattedDate}.\nSub: ${emailObject.subject}\nAttachments: ${attachmentString}\n`;
    
    let messageBody = emailObject.message;
    let availableChars = maxChars - smsBodyHeader.length;
    
    let sms = smsBodyHeader + messageBody;

    if (messageBody.length > availableChars) {
        console.info("HUGE ASS EMAIL DETECTED! - Splitting to save us!");
        let counter = 1;
        availableChars -= (continueMsg.length + 2); // + 2 for the SMS Number place holder
        while(messageBody.length > 0 ) {
            console.info("Sending remaining chunks of size:" + availableChars);
            if (counter == 1) {
                sms = smsBodyHeader + messageBody.substring(0, availableChars) + continueMsg + counter;
                availableChars += smsBodyHeader.length // No More headers in subsequent SMSes..
            }
            else if (messageBody.length <= availableChars) 
                sms = messageBody;
            else
                sms = messageBody.substring(0,availableChars) + continueMsg + counter;
            messageBody = messageBody.substring(availableChars, messageBody.length);
            sendSMS(sms);
            counter+=1;
        }
    }
    else 
        sendSMS(sms);
    console.info("Done Sending!");
}

parseToEmail = (smsObject) => {
    //Code to parse smsObject to an EmailObject
}


// Express App 
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
    console.log("Connection to DB Established");
    app.listen(process.env.PORT, () => {
        console.info('Listening on port ' + process.env.PORT);
    });
    //Route for handling web client - should be able to ditch it at some point!
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/client/index.html')
    });
    //Handle call from IMAP to trigger a new incoming Email
    app.post('/new-email', (req, res) => {
        new Email(req.body)
        .save((err, res) => {
            if(err)
                console.log("Save Failed:" + err);
            else
                parseToSMS(res);
        })
        res.redirect('/');
    });
    //Handle a call from Twilio Webhook to handle incoming SMS and take necessary Steps
    app.post('/new-sms', (req, res) => {
        parseToEmail(req.body);
        res.redirect('/');
    });
});



