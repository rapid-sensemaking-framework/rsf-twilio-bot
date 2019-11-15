import * as dotenv from 'dotenv'
import * as socketIO from 'socket.io'
import * as http from 'http'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as twilio from 'twilio'
const MessagingResponse = twilio.twiml.MessagingResponse
dotenv.config()

import { SEND_MESSAGE, RECEIVE_MESSAGE, TwilioMessage } from './protocol'

const SENDER_NUMBER = process.env.TWILIO_SENDER_NUMBER
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
// the service that will be used to make requests to the twilio api
const client = twilio(ACCOUNT_SID, AUTH_TOKEN)

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
const server = http.createServer(app).listen(process.env.PORT, () => {
  console.log('starting http server to listen for text messages on port ' + process.env.PORT)
})
const io = socketIO(server)

io.on('connection', (socket) => {
  socket.on(SEND_MESSAGE, (twilioMessage: TwilioMessage) => {
    const { number, message } = twilioMessage
    client.messages.create({
        body: message,
        from: SENDER_NUMBER,
        to: number
    })
  })
})

// listen for messages
app.post('/sms', (req, res) => {
  // send back an empty response
  res.writeHead(200, { 'Content-Type': 'text/xml' })
  res.end(new MessagingResponse().toString())

  // use the ID/phone number as the event type, and the
  // text as the event message
  // req.body.From is the phone number
  // req.body.Body is the text

  console.log('receiving twilio message from ' + req.body.From)
  const twilioMessage: TwilioMessage = {
    number: req.body.From,
    message: req.body.Body
  }
  // send to all connected sockets
  io.sockets.emit(RECEIVE_MESSAGE, twilioMessage)
})
