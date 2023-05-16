import { Router } from 'express'
import sms from './routes/sms'
export default () => {
  const app = Router()
  sms(app)
  return app
}
