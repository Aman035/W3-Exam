import examABI from './abis/Exam.json'
import examFactoryABI from './abis/ExamFactory.json'

export const config = {
  examABI: examABI,
  examFactoryAddress: '0x0f22374F9595FDDE0B91c0c1b70c522151e85a39',
  examFactoryABI: examFactoryABI,
  alechemyKey: process.env.REACT_APP_ALCHEMY_KEY,
  web3StorageToken: process.env.REACT_APP_WEB3_STORAGE_TOKEN,
  convertAPIURL: 'https://v2.convertapi.com/convert/pdf/to/encrypt',
  convertAPIToken: process.env.REACT_APP_CONVERT_API_TOKEN,
}
