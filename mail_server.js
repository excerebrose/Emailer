require('dotenv').config({path: './config.env'});

const notifier = require('mail-notifier');
const request = require('request');

// IMAP object that listens to new incoming emails - however it marks them 'UNREAD'
// Make sure you dont have any unread emails in your inbox or else all are gonna come flooding in!

const inbox = {
  user: process.env.IMAP_USER,
  password: process.env.IMAP_PASS,
  host: process.env.IMAP_HOST,
  port: process.env.IMAP_PORT, 
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

notifier(inbox).on('mail', (mail) => {
    console.log(mail.subject);
    const mailObject = {
        from: mail.from[0].address,
        name: mail.from[0].name,
        date: mail.receivedDate,
        subject: mail.subject? mail.subject : 'No Subject',
        message: mail.text && mail.text.replace(/\s/g,'').length > 0? mail.text : 'No Message body',
        attachments: mail.attachments? mail.attachments.map(value => value.fileName).join(' ') : 'None',
    };
    request.post(process.env.WEBHOOK_TARGET).form(mailObject);
    console.info("New Email Received!")
}).start();