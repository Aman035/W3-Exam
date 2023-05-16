import { Router, Request, Response, NextFunction } from 'express'
import { errors } from 'celebrate'
import Logger from '../../loaders/logger'

const route = Router()

export default (app: Router) => {
  app.use(errors())
  app.use(`/sms`, route)

  route.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // todo call Add Sheet Hash
    } catch (e) {
      Logger.error('🔥 error: %o', e)
      return next(e)
    }
  })
}
