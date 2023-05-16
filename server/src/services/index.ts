import config from '../config'
import { getContractData } from './contract'
import { verifySignature } from './signature'

/**
 * Add the examSheet Hash to the Specific Exam Contract Address
 * @param hash Exam Sheet Hash
 * @param contract Exam Contract
 * @param signature Sender's signature
 */
export const addSheetHash = (
  hash: string,
  contract: string,
  signature: string
): void => {
  //todo - Get Address from signature
  //todo - Call Contract to add sheet Hash
}

/**
 *
 * @param password Exam Password
 * @param signature Password Signed by Creator of Exam
 */
export const broadcastExamPassword = async (
  password: string,
  signature: string,
  contractAddress: string
): Promise<void> => {
  const creator = await getContractData('creator', contractAddress)
  // verifySignature(password, signature, creator)
  const studentData = await getContractData('', contractAddress)
  //todo - get all enrolled student data no. and send msg to them
}
