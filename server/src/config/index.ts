import dotenv from 'dotenv'
const envFound = dotenv.config()
import examABI from './examABI.json'

if (envFound.error) {
  // This error should crash whole process
  throw new Error("⚠️  Couldn't find .env file  ⚠️")
}

export default {
  // Environment
  env: process.env.NODE_ENV || 'development',
  // Server Port
  port: process.env.PORT || 3001,
  // Winston logger level
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  /**
   * API Config
   */
  api: {
    prefix: '/api',
  },

  /**
   * WEB3 Config
   */
  provider: process.env.PROVIDER || '',
  chainId: 80001,
  servicerAccount: process.env.ACCOUNT || '',
  servicerPvtKey: process.env.PRIVATE_KEY || '',
  contractABI: examABI,

  /**
   * Twilio Config
   */
  twilioSID: process.env.TWILIO_ACCOUNT_SID,
  twilioToken: process.env.TWILIO_AUTH_TOKEN,
  twilioNum: process.env.TWILIO_PHONE_NO,
}
