require('dotenv').config({path: './config.env'});

const express = require('express');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const twilio_client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN); 
const moment = require('moment');
const validator = require('validator');
const nodemailer = require('nodemailer');

// Helper Functions
//let incomingEmail = {state: null, nextState:"init", obj: {}};

/*
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
    const toQuery = "Receipient Email ID? (Reply as eid:name@xyz.com)";
    const subjectQuery = "Subject? (Reply as sub: Bla Bla Bla!)";
    const messageQuery = "Message? (Reply as msg: Bla bla bla) (Under 1600 characs)";
    const incorrectStep = `Wrong step! Please enter: ${incomingEmail.nextState} or Start new email`;

    const currentCommand = smsObject.substring(0,3).toLowerCase();
    let str = smsObject.substring(4, smsObject.length);

    let nextSMS = "";
    switch(currentCommand) {
        case "new":
            if (incomingEmail.state)
                nextSMS = "Existing email deleted. Starting again\n";
            updateEmailState("init","eid");
            nextSMS+=toQuery;
            break;
        case "eid":
            str = str.replace(/\s/g, "");
            if(incomingEmail.nextState != "eid")
                nextSMS = incorrectStep;
            else if (validator.isEmail(str)) {
                updateEmailState("eid","sub");
                addNewEmailObjectProperty("to",str);
                nextSMS = subjectQuery;
            }
            else
                nextSMS="Invalid Email Address! Try Again:..";
            break;
        case "sub":
            if(incomingEmail.nextState != "sub")
                nextSMS = incorrectStep;
            else {
                updateEmailState("sub","msg");
                addNewEmailObjectProperty("sub", str);
                nextSMS = messageQuery;
            }
            break;
        case "msg":
            if(incomingEmail.nextState != "msg")
                nextSMS = incorrectStep;
            else {
                updateEmailState("msg","end");
                addNewEmailObjectProperty("msg", str);
                nextSMS = sendEmail();
            }
            break;
        default:
            nextSMS = "Command Not Found - Try Again";
            break;
    };
    sendSMS(nextSMS);
}

*/

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


