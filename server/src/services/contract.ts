import Web3 from 'web3'
import config from '../config'

const web3 = new Web3(config.provider as string)
const contractABI: any = config.contractABI

export const getContractData = async (
  contractFunction: string,
  contractAddress: string
) => {
  const contract = new web3.eth.Contract(contractABI, contractAddress)
  const result = await contract.methods[contractFunction]().call()
  return result
}

export const callContractFunction = async (
  contractAddress: string,
  contractFunction: string,
  params: any[]
) => {
  const account = config.servicerAccount
  const privateKey = config.servicerPvtKey

  const contract = new web3.eth.Contract(contractABI, contractAddress)
  const encodedABI = contract.methods[contractFunction](...params).encodeABI()
  const gasPrice = await web3.eth.getGasPrice()
  const gasLimit = await contract.methods[contractFunction](
    ...params
  ).estimateGas()

  const tx = {
    from: account,
    to: contractAddress,
    data: encodedABI,
    gasPrice: gasPrice,
    gas: gasLimit,
  }

  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)

  const txReceipt = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction as string
  )

  return txReceipt.transactionHash
}
