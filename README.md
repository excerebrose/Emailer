# Emailer
A NodeJS Application to Send and Receive Emails via Twilio SMS!

## Initial Setup
- Clone the repository.
- Install dependencies 
  ```
  yarn install
  ```
- Go to [Twilio Console](https://www.twilio.com/console) to get Your Twilio Keys and Phone number.
- Modify the *.example.env files with your values and rename them to *.env (These are private variables and make sure you don't push them to your repo!)

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