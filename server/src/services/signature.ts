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
  const recoveredAddress = recoverAddress(hashMessage(message), signature)
  return address.toLowerCase() === recoveredAddress.toLowerCase()
}
