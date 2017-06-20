require('dotenv').config({ path: './config.env' });

const request = require('request');
const notifier = require('mail-notifier');
 
const inbox = {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASS,
    host: process.env.IMAP_HOST,
    port: process.env.IMAP_PORT,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};

notifier(inbox).on('mail', (mail) => {
   const mailObject = {
       from: mail.from[0].address,
       name: mail.from[0].name,
       date: mail.receivedDate,
       subject: mail.subject ? mail.subject : 'No Subject',
       message: mail.text && mail.text.replace(/\s/g,'').length > 0? mail.text : 'No Message body',
       attachments: mail.attachments ? mail.attachments.map(value => value.fileName).join(' ') : 'None',
   };
   request.post(process.env.WEBHOOK_TARGET).form(mailObject);
   console.info("New Email Received!")
}).start();