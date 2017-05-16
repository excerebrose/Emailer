require('dotenv').config({path: './mail_config.env'});

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
    let attachments = mail.attachments? mail.attachments : [];
    attachments = attachments.map(value => value.fileName);
    const mailObject = {
        from: mail.from[0].address,
        name: mail.from[0].name,
        date: mail.receivedDate,
        subject: mail.subject,
        message: mail.text,
        attachments,
    };
    request.post(process.env.WEBHOOK_TARGET).form(mailObject);
    console.info("New Email Received!")
}).start();