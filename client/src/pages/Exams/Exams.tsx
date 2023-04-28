import React, { useEffect, useState } from "react";
import "react-dropzone-uploader/dist/styles.css";
import "./Exams.scss";
import { useContractRead } from "wagmi";
import { config } from "../../config";
import "react-datetime/css/react-datetime.css";
import Toast from "../../components/Toast/Toast";
import { readContracts } from "wagmi";
import { CIDString, Web3Storage } from "web3.storage";
import Card from "../../components/Card/Card";

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
      const examMeta = await files![0].arrayBuffer();
      const uint8Array = new Uint8Array(examMeta);
      const jsonStr = new TextDecoder().decode(uint8Array);
      const jsonObj = JSON.parse(jsonStr);
      const data = {
        address: each,
        creator: examDetails[0],
        name: jsonObj.name,
        info: jsonObj.info,
        examSheet: files![1],
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
      {examData.map((exam: any) => (
        <Card key={exam.address} {...exam} />
      ))}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
}

export default Exams;
