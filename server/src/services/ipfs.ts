import { Web3Storage } from 'web3.storage'
import config from '../config'

export const IPFSData = async (cid: string): Promise<any> => {
  try {
    const client = new Web3Storage({ token: config.web3StorageToken })

    const metaCID = await client.get(cid)
    const metaFile: any = await metaCID?.files()
    const studentMeta: any = Buffer.from(await metaFile![0].arrayBuffer())
    const uint8Array = new Uint8Array(studentMeta)
    const jsonStr = new TextDecoder().decode(uint8Array)
    const jsonObj = JSON.parse(jsonStr)
    return jsonObj
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}
