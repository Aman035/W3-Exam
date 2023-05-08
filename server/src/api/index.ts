import { Router } from 'express'
import routes from './routes'
export default () => {
  const app = Router()
  routes(app)

  return app
}
