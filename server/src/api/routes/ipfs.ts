import { Router, Request, Response, NextFunction } from 'express'
import { errors } from 'celebrate'
import config from '../../config'
import { SpheronClient, ProtocolEnum } from '@spheron/storage'

const route = Router()

export default (app: Router) => {
  app.use(errors())
  app.use(`/ipfs`, route)
  route.get(
    '/initiate-upload',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const bucketName = 'w3-exam-browser-upload' // use your preferred name
        const protocol = ProtocolEnum.IPFS // use your preferred protocol
        const token = config.spheronToken
        const client = new SpheronClient({ token })

        const { uploadToken } = await client.createSingleUploadToken({
          name: bucketName,
          protocol,
        })

        res.status(200).json({
          uploadToken,
        })
      } catch (error) {
        console.error(error)
        next(error)
      }
    }
  )
}
