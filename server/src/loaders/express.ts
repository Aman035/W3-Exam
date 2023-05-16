import bodyParser from 'body-parser'
import { errors } from 'celebrate'
import cors from 'cors'
import express from 'express'
import { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import config from '../config'
import routes from '../api'

export default (app: express.Application) => {
  app.enable('trust proxy')
  app.use(cors())
  app.use(helmet())
  app.use(bodyParser.json())
  app.use(errors())

  app.get('/', (req, res) => {
    res.send('Welcome to W3 Exam Server!')
  })

  app.get('/status', (req, res) => {
    res.status(200).end()
  })

  app.use(config.api.prefix, routes())

  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err: any = new Error('Not Found')
    err.status = 404
    next(err)
  })

  /// error handlers
  app.use(
    (
      err: { name: string; status: number; message: string },
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      /**
       * Handle 401 thrown by express-jwt library
       */
      if (err.name === 'UnauthorizedError') {
        return res.status(err.status).send({ message: err.message }).end()
      }
      return next(err)
    }
  )
  app.use(
    (
      err: { status: number; message: string },
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      res.status(err.status || 500)
      res.json({
        errors: {
          message: err.message,
        },
      })
    }
  )
}
