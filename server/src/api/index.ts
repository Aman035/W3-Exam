import { Router } from 'express'
import sms from './routes/sms'
import ipfs from './routes/ipfs'

export default () => {
  const app = Router()
  sms(app)
  ipfs(app)
  return app
}
