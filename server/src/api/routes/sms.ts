import { Router, Request, Response, NextFunction } from 'express'
import { errors } from 'celebrate'
import Logger from '../../loaders/logger'
import { sendSMS } from '../../services/twilio'

const route = Router()

export default (app: Router) => {
  app.use(errors())
  app.use(`/sms`, route)

  route.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // body has action and a string
      // action = PUBLISH - msg password string to everyone
      // action = SUBMIT - submit sheet hash
      // todo call Add Sheet Hash
      throw new Error('Sd')
    } catch (e) {
      Logger.error('🔥 error: %o', e)
      sendSMS(
        `Error In Submitting Sheet Hash!\nPlease Check if the message format is correct.\nPlease Retry or contact the exam creator`,
        req.body.From
      )
      return next(e)
    }
  })
}
