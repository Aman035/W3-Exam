import dotenv from 'dotenv'
const envFound = dotenv.config()

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
  // API configs
  api: {
    prefix: '/api',
  },
  // Provider
  provider: process.env.PROVIDER,
  //chainId
  chainId: 80001,
  //servicer private key
  servicerPvtKey: process.env.PRIVATE_KEY || '',
  /**
   * Twilio Config
   */
  twilioSID: process.env.TWILIO_ACCOUNT_SID,
  twilioToken: process.env.TWILIO_AUTH_TOKEN,
  twilioNum: process.env.TWILIO_PHONE_NO,
}
