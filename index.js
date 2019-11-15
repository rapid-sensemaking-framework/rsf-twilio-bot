"use strict";
exports.__esModule = true;
var dotenv = require("dotenv");
var socketIO = require("socket.io");
var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
var twilio = require("twilio");
var MessagingResponse = twilio.twiml.MessagingResponse;
dotenv.config();
var protocol_1 = require("./protocol");
var SENDER_NUMBER = process.env.TWILIO_SENDER_NUMBER;
var ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
var AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// the service that will be used to make requests to the twilio api
var client = twilio(ACCOUNT_SID, AUTH_TOKEN);
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
var server = http.createServer(app).listen(process.env.PORT, function () {
    console.log('starting http server to listen for text messages on port ' + process.env.PORT);
});
var io = socketIO(server);
io.on('connection', function (socket) {
    socket.on(protocol_1.SEND_MESSAGE, function (twilioMessage) {
        var number = twilioMessage.number, message = twilioMessage.message;
        client.messages.create({
            body: message,
            from: SENDER_NUMBER,
            to: number
        });
    });
});
// listen for messages
app.post('/sms', function (req, res) {
    // send back an empty response
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(new MessagingResponse().toString());
    // use the ID/phone number as the event type, and the
    // text as the event message
    // req.body.From is the phone number
    // req.body.Body is the text
    console.log('receiving twilio message from ' + req.body.From);
    var twilioMessage = {
        number: req.body.From,
        message: req.body.Body
    };
    // send to all connected sockets
    io.sockets.emit(protocol_1.RECEIVE_MESSAGE, twilioMessage);
});
