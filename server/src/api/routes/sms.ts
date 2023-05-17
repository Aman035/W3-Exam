import { Router, Request, Response, NextFunction } from 'express'
import { errors } from 'celebrate'
import Logger from '../../loaders/logger'
import { sendSMS } from '../../services/twilio'
import { getSigner, verifySignature } from '../../services/signature'
import { callContractFunction } from '../../services/contract'
import config from '../../config'

const route = Router()

export default (app: Router) => {
  app.use(errors())
  app.use(`/sms`, route)

  route.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [action, msg, contractAddress, sign] = req.body.Body.split(' ')
      if (action === 'SUBMIT') {
        const signer = getSigner(msg, sign)
        await callContractFunction(contractAddress, 'addSheetHash', [
          signer,
          msg,
        ])
      } else if (action === 'PUBLISH') {
        if (!verifySignature(msg, sign, config.servicerAccount))
          throw new Error('Invalid Signature')
      } else throw new Error('Invalid Action!!')

      await sendSMS('Success', req.body.From)
    } catch (e: any) {
      Logger.error('🔥 error: %o', e)
      await sendSMS(
        `Error In Submitting Sheet Hash!\nPlease Check if the message format is correct.\nPlease Retry or contact the exam creator`,
        req.body.From
      )
      await sendSMS(e.message, req.body.From)
      return next(e)
    }
  })
}
