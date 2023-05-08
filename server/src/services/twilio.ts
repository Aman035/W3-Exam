import config from '../config'
import { Twilio } from 'twilio'

/**
 * Sends SMS Using Twilio
 * @param body SMS body
 * @param to SMS Receiver
 */
export const sendSMS = async (body: string, to: string) => {
  const client = new Twilio(config.twilioSID, config.twilioToken)
  await client.messages.create({
    body,
    from: config.twilioNum,
    to,
  })
}
