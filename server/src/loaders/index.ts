import * as express from 'express'
import Logger from './logger'
import expressLoader from './express'

export default async (app: express.Application) => {
  await expressLoader(app)
  Logger.info('Express loaded!')
}
