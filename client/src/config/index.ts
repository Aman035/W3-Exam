import examABI from './abis/Exam.json'
import examFactoryABI from './abis/ExamFactory.json'

export const config = {
  examABI: examABI,
  examFactoryAddress: '0xeA2DEd9D03dADf5a84d19d42E5dAfbF270b92658',
  examFactoryABI: examFactoryABI,
  alechemyKey: process.env.REACT_APP_ALCHEMY_KEY,
  convertAPIURL: 'https://v2.convertapi.com/convert/pdf/to/encrypt',
  convertAPIToken: process.env.REACT_APP_CONVERT_API_TOKEN,
  backendURL: process.env.REACT_APP_BACKEND_URL,
}
