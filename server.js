const express = require('express');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');

const config = require('./config');

let db = null;
const app = express();


app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect(config.DB_URL);

db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//Mongo Models
const QuoteSchema = mongoose.Schema({
    name: String,
    quote: String,
});

let Quote = mongoose.model('Quotes', QuoteSchema);

db.once('open', function() {
    console.log("Connection to DB Establish");
    app.listen(config.PORT, () => {
        console.info('Listening on port ' + config.PORT);
    });
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/client/index.html')
    });
    app.post('/quotes', (req, res) => {
        new Quote(req.body)
        .save((err, res) => {
            console.log("Saved: "+ res);
        })
        res.redirect('/');
    });
});



