import axios from 'axios'

export const IPFSGet = async (ipfsUrl: string): Promise<any> => {
  try {
    // Perform axios GET request to the specified URL
    const response = await axios.get(ipfsUrl)

    // Check if response is successful
    if (response.status === 200) {
      // Parse the JSON response data
      const jsonObj = response.data
      return jsonObj
    } else {
      // Handle unsuccessful response
      throw new Error(
        `Failed to fetch data from IPFS. Status: ${response.status}`
      )
    }
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error('Error fetching data from IPFS:', error)
    throw error
  }
}
