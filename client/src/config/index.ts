import examABI from './abis/Exam.json'
import examFactoryABI from './abis/ExamFactory.json'

export const config = {
  examABI: examABI,
  examFactoryAddress: '0xe83d56Af1E0663E0914EcB4cFaF93d1695D281f8',
  examFactoryABI: examFactoryABI,
  alechemyKey: process.env.REACT_APP_ALCHEMY_KEY,
  convertAPIURL: 'https://v2.convertapi.com/convert/pdf/to/encrypt',
  convertAPIToken: process.env.REACT_APP_CONVERT_API_TOKEN,
  backendURL: process.env.REACT_APP_BACKEND_URL,
}
