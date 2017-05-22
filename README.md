# Emailer
A NodeJS Application to Send and Receive Emails via Twilio SMS!

## Initial Setup
- Clone the repository.
- Install dependencies (If you don't want to use Yarn, just replace the commands below with **npm** )
  ```
  yarn install
  ```
- Go to [Twilio Console](https://www.twilio.com/console) to get Your Twilio Keys and Phone number.
- Modify the *.env.example files with your values and rename them to *.env (These are private variables and make sure you don't push them to your repo!)

## Run The Project
To run both the servers:
```
yarn dev
```
To run only the main server:
```
yarn dev:server
```
To run only the IMAP server:
```
yarn dev:mail
```
## How the project works
Basically you have two (Limited) Options to work with at the moment. **Receive** and **Send**
- Your IMAP Server listens for new incoming emails and sends the to you via SMS
- You can initiate a new E-mail at any point by texting from your phone to your Twilio Number by sending the following messages and waiting for a reply for the next step:
```
You: New
[Your Twilio Number]: Receipient Email ID? (Reply as eid:name@xyz.com)
You: eid: abc@xyz.com 
[Your Twilio Number]: Subject? (Reply as sub: Bla Bla Bla!)
You: sub: Heya
[Your Twilio Number]: Message? (Reply as msg: Bla bla bla) (Under 1600 characs)
You: msg: First Test Email!
[Your Twilio Number]: Email Sent!
```
