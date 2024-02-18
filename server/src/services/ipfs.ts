import { Web3Storage } from 'web3.storage'
import config from '../config'

export const IPFSGet = async (cid: string): Promise<any> => {
  const client = new Web3Storage({ token: config.web3StorageToken })
  const metaCID = await client.get(cid)
  const metaFile: any = await metaCID?.files()
  const studentMeta: any = Buffer.from(await metaFile![0].arrayBuffer())
  const uint8Array = new Uint8Array(studentMeta)
  const jsonStr = new TextDecoder().decode(uint8Array)
  const jsonObj = JSON.parse(jsonStr)
  return jsonObj
}

export const IPFSUpload = async (data: any): Promise<string> => {
  const client = new Web3Storage({ token: config.web3StorageToken })
  const cid = await client.put([data])
  return cid.toString()
}
