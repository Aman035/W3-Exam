import { Router, Request, Response, NextFunction } from 'express'
import { errors } from 'celebrate'
import Logger from '../../loaders/logger'
import { sendSMS } from '../../services/twilio'
import { getSigner, verifySignature } from '../../services/signature'
import { callContractFunction, getContractData } from '../../services/contract'
import { IPFSGet } from '../../services/ipfs'

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
        await sendSMS('Success', req.body.From)
      } else if (action === 'PUBLISH') {
        // ALLOW ONLY CREATOR TO PUBLISH
        const creator = await getContractData('creator', contractAddress)
        if (!verifySignature(msg, sign, creator))
          throw new Error('Invalid Signature')

        const result = await getContractData(
          'getEnrolledStudents',
          contractAddress
        )
        result.forEach(async (each: any) => {
          const detailsHash = each[1]
          const details = await IPFSGet(detailsHash)
          try {
            await sendSMS(`Exam Password: ${msg}`, `whatsapp:${details.phone}`)
            await sendSMS(`Sent to ${details.name}`, req.body.From)
          } catch (err) {
            await sendSMS(`Can't send to ${details.name}`, req.body.From)
          }
        })
      } else throw new Error('Invalid Action!!')
    } catch (e: any) {
      Logger.error('🔥 error: %o', e)
      await sendSMS('Failed', req.body.From)
      return next(e)
    }
  })
}
