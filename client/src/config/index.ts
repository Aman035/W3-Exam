import examABI from "./abis/Exam.json";
import examFactoryABI from "./abis/ExamFactory.json";

export const config = {
  examABI: examABI,
  examFactoryAddress: "0xE87A3884d7b1878e851622675A6A10b3801E944a",
  examFactoryABI: examFactoryABI,
  alechemyKey: process.env.REACT_APP_ALCHEMY_KEY,
  web3StorageToken: process.env.REACT_APP_WEB3_STORAGE_TOKEN,
  convertAPIURL: "https://v2.convertapi.com/convert/pdf/to/encrypt",
  convertAPIToken: process.env.REACT_APP_CONVERT_API_TOKEN,
};
