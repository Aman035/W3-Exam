import examABI from "./abis/Exam.json";
import examFactoryABI from "./abis/ExamFactory.json";

export const config = {
  examABI: examABI,
  examFactoryAddress: "0xC7B2183fCA9Fd2931a5C417a5281Dd00e2Bf8146",
  examFactoryABI: examFactoryABI,
  alechemyKey: process.env.REACT_APP_ALCHEMY_KEY,
  web3StorageToken: process.env.REACT_APP_WEB3_STORAGE_TOKEN,
  convertAPIURL: "https://v2.convertapi.com/convert/pdf/to/encrypt",
  convertAPIToken: process.env.REACT_APP_CONVERT_API_TOKEN,
};
