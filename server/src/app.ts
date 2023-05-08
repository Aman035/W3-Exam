import 'reflect-metadata'
import config from './config'
import express from 'express'
import Logger from './loaders/logger'
import Loaders from './loaders'

async function startServer() {
  const app = express()
  await Loaders(app)

  app
    .listen(config.port, () => {
      console.log(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `)
    })
    .on('error', (err) => {
      Logger.error(err)
      process.exit(1)
    })
}

startServer()
