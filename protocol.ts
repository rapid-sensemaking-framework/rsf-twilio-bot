
const RECEIVE_MESSAGE = 'receive_message'
const SEND_MESSAGE = 'send_message'

interface TwilioMessage {
  number: string
  message: string
}

export {
  RECEIVE_MESSAGE,
  SEND_MESSAGE,
  TwilioMessage
}