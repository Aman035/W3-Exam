export {}

// /* eslint-disable react-hooks/rules-of-hooks */
// import { config as Config } from '../config';
// import { ethers } from 'ethers';
// import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';

// const contractConfig = {
//     addressOrName: Config.examFactoryAddress,
//     contractInterface: Config.examFactoryABI,
//   };

// export const createExam = async() => {

//     const { config } = useContractWrite({
//     ...contractConfig,
//     functionName: 'changeFee',
//     })
//     // const { data, isLoading, isSuccess, write } = useContractWrite(config)
// }