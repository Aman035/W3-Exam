import { Web3Storage } from 'web3.storage'
import config from '../config'

export const IPFSData = async (cid: string) => {
  const client = new Web3Storage({ token: config.web3StorageToken })
  const res: any = await client.get(cid)
  console.log(`Got a response! [${res.status}] ${res.statusText}`)
  if (!res.ok) {
    throw new Error(`failed to get ${cid}`)
  }
  return res.response
}
