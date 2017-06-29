require('dotenv').config({path: './config.env'});

const express = require('express');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const twilio_client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN); 
const moment = require('moment');
const validator = require('validator');
const nodemailer = require('nodemailer');

// Helper Functions
let incomingEmail = {state: null, nextState:"init", obj: {}};

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASS
    }
});

updateEmailState = (state=null, nextState=null) => {
    incomingEmail.state = state;
    incomingEmail.nextState = nextState;
}

addNewEmailObjectProperty = (key=null, value=null) => {
    if(key && value)
        incomingEmail.obj[key] = value;
    else
        incomingEmail.obj = {};
}

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

sendEmail = () => {
    //Code to send Email and onSuccess return String and clear out global incomingEmail
    const mailOptions = {
        from: process.env.IMAP_USER, 
        to: incomingEmail.obj.to, 
        subject: incomingEmail.obj.sub, 
        text: incomingEmail.obj.msg,
    };
   transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            sendSMS("Email Sending Failed! Try Again..")
        }
    });
    //Empty out the global mail object
    updateEmailState();
    addNewEmailObjectProperty();
    return 'Email Sent!';
}

parseToSMS = (emailObject) => {
    const maxChars = 1500; //Changed to 1500 because of Twilio's injection into free accounts - move it up to 1600 later'
    const formattedDate = moment(emailObject.date).format('ddd, MMM Do YYYY, h:m A');
    let messageBody = emailObject.message;
    
    const smsBodyHeader = `New email from:${emailObject.from}, at ${formattedDate}.\nSub: ${emailObject.subject}\nAttachments: ${emailObject.attachments}\n`;
    let sms = smsBodyHeader + messageBody;

    //Helpers
    let availableChars = maxChars - smsBodyHeader.length;    
    const continueMsg = "\nContinued in Next SMS. - Number ";

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
  const toQuery = 'Recipient Email address?';
  const subjectQuery = 'Subject?';
  const messageQuery = 'Message? (Under 1600 characs)';

  smsBody = smsBody.trim();
  const isNew = smsBody.toLowerCase() === 'new';
  let nextSMS = '';

  if (isNew) {
    if (incomingEmail.state)
      nextSMS = 'Existing email deleted. Starting again\n';
    updateEmailState('init', 'eid');
    nextSMS += toQuery;
  } else {
    switch (incomingEmail.nextState) {
      case 'eid':
        if (validator.isEmail(smsBody)) {
          updateEmailState('eid', 'sub');
          addNewEmailObjectProperty('to', smsBody);
          nextSMS = subjectQuery;
        } else {
          nextSMS = 'Invalid Email Address! Try Again:..';
        }
        break;
      case 'sub':
        updateEmailState('sub', 'msg');
        addNewEmailObjectProperty('sub', smsBody);
        nextSMS = messageQuery;
        break;
      case 'msg':
        updateEmailState('msg', 'end');
        addNewEmailObjectProperty('msg', smsBody);
        nextSMS = sendEmail();
        break;
      default:
        nextSMS = 'Would you like to send a new email? Start by texting in "new".';
        break;
    }
  }
  sendSMS(nextSMS);
}


// Express App 
let db = null;
const app = express();

//Basic Express App Setup
app.use(bodyParser.urlencoded({extended: true}));
app.use('/static', express.static(__dirname + '/client'));

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
    attachments: String,
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
            if(err) {
                console.log("Save Failed:" + err);
                res.send(400);
            }
            else
                parseToSMS(res);
        })
        res.sendStatus(200);
    });
    //Handle a call from Twilio Webhook to handle incoming SMS and take necessary Steps
    app.post('/new-sms', (req, res) => {
        parseToEmail(req.body.Body);
        res.sendStatus(200);
    });
});


