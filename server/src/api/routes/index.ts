import { Router, Request, Response, NextFunction } from 'express'
import { errors } from 'celebrate'
import Logger from '../../loaders/logger'

const route = Router()

export default (app: Router) => {
  app.use(errors())
  app.use(route)

  route.post('/', async (req: Request, res: Response, next: NextFunction) => {
    Logger.debug('Calling with command: %o', req.body.command)
    try {
      return res.status(201).json('W3 Sever')
    } catch (e) {
      Logger.error('🔥 error: %o', e)
      return next(e)
    }
  })
}
