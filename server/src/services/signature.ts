import { recoverAddress, hashMessage } from 'ethers'

/**
 * Verifies a eip191 signature
 * @param message signed message
 * @param signature eip191 sig
 * @param address address to be checked for verification
 * @returns verification status
 */
export const verifySignature = (
  message: string,
  signature: string,
  address: string
): boolean => {
  const signer = getSigner(message, signature)
  return address.toLowerCase() === signer.toLowerCase()
}

/**
 * Returns the wallet address which signed a message
 * @param message signed message
 * @param signature eip191 sig
 * @returns address
 */
export const getSigner = (message: string, signature: string): string => {
  const recoveredAddress = recoverAddress(hashMessage(message), signature)
  return recoveredAddress
}
