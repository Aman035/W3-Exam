import React, { useEffect, useState } from "react";
import "react-dropzone-uploader/dist/styles.css";
import "./Exams.scss";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useContract, useContractRead } from "wagmi";
import { config } from "../../config";
import "react-datetime/css/react-datetime.css";
import Toast from "../../components/Toast/Toast";
import { readContracts } from "wagmi";
import { CIDString, Web3Storage } from "web3.storage";

function Exams() {
  const [loading, setLoading] = useState(true);
  const [examAddress, setExamAddress] = useState<any>([]);
  const [examData, setExamData] = useState<any>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "warning";
  } | null>(null);

  const closeToast = () => {
    setToast(null);
  };

  const examFactoryContract = {
    address: config.examFactoryAddress,
    abi: config.examFactoryABI,
  };

  const { data, isError, isLoading } = useContractRead({
    address: config.examFactoryAddress as `0x${string}`,
    abi: config.examFactoryABI,
    functionName: "getDeplyedExams",
  });

  useEffect(() => {
    setExamAddress(data);
    setLoading(isLoading);
    if (isError) {
      setToast({
        message: "Unable To Get Exam Data !!!",
        type: "error",
      });
    }

    examAddress.map(async (each: `0x${string}`) => {
      const examContract = {
        address: each,
        abi: config.examABI,
      };
      const examDetails = await readContracts({
        contracts: [
          {
            ...examContract,
            functionName: "creator",
          },
          {
            ...examContract,
            functionName: "examData",
          },
          {
            ...examContract,
            functionName: "startTime",
          },
          {
            ...examContract,
            functionName: "endTime",
          },
        ],
      });
      const client = new Web3Storage({
        token: process.env.REACT_APP_WEB3_STORAGE_TOKEN!,
      });
      const res = await client.get(examDetails[1] as CIDString);
      const files = await res?.files();
      for (const file of files!) {
        const data = await file.arrayBuffer();
        const uint8Array = new Uint8Array(data);
        const jsonStr = new TextDecoder().decode(uint8Array);
        const jsonObj = JSON.parse(jsonStr);
        console.log(jsonObj);
        // const url = `https://${file.cid}.ipfs.dweb.link/`;
        // const response = await fetch(url);
        // console.log(response.json);
        //     const response = await fetch(url)
        // const data = await response.json()
        //   const temp = await client.get(file.cid);
        //   console.log(temp);
      }
      const data = {
        creator: examDetails[0],
        meta: examDetails[1],
        startTime: examDetails[2],
        endTime: examDetails[3],
      };
      setExamData((prevState: any) => [data, ...prevState]);
    });
  }, [examAddress]);

  return (
    <div className="container">
      <div>
        <h1 className="title">Exams</h1>
        <h3 className="info">You can browse all the created Exams</h3>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
}

export default Exams;
