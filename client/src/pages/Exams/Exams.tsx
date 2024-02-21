import React, { useEffect, useState } from 'react'
import 'react-dropzone-uploader/dist/styles.css'
import './Exams.scss'
import { useContractRead } from 'wagmi'
import { config } from '../../config'
import 'react-datetime/css/react-datetime.css'
import Toast from '../../components/Toast/Toast'
import Card from '../../components/Card/Card'
import axios from 'axios'
import Loader from '../../components/Loader/Loader'

interface ExamData {
  address: `0x${string}`
  creator: `0x${string}`
  name: string
  info: string
  startTime: { _hex: string }
  endTime: { _hex: string }
}

const Exams = () => {
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'warning'
  } | null>(null)

  const closeToast = () => {
    setToast(null)
  }

  const {
    data: examsAddress,
    // isError,
    isLoading,
  } = useContractRead({
    address: config.examFactoryAddress as `0x${string}`,
    abi: config.examFactoryABI,
    functionName: 'getDeplyedExams',
    args: [],
  })

  // useEffect(() => {
  //   if (isError) {
  //     setToast({
  //       message: 'Unable To Get Exams !!!',
  //       type: 'error',
  //     })
  //   }
  // }, [isError])

  return (
    <div className="container">
      <div>
        <h1 className="title">Exams</h1>
        <h3 className="info">You can browse all the created Exams</h3>
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {(examsAddress as `0x${string}`[]).map((examAddress) => (
            <ExamCard key={examAddress} examAddress={examAddress} />
          ))}
        </>
      )}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  )
}

const ExamCard = ({ examAddress }: { examAddress: `0x${string}` }) => {
  const [examData, setExamData] = useState<ExamData | null>(null)

  const examContract = {
    address: examAddress,
    abi: config.examABI,
  }

  const { data: creator } = useContractRead({
    ...examContract,
    functionName: 'creator',
    args: [],
  })
  const { data: examMetaDataLink } = useContractRead({
    ...examContract,
    functionName: 'examData',
    args: [],
  })
  const { data: startTime } = useContractRead({
    ...examContract,
    functionName: 'startTime',
    args: [],
  })
  const { data: endTime } = useContractRead({
    ...examContract,
    functionName: 'endTime',
    args: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      if (examMetaDataLink) {
        try {
          const examMetaData = (
            await axios.get(`${examMetaDataLink}/examDetails`)
          ).data

          const data: ExamData = {
            address: examAddress,
            creator: creator as `0x${string}`,
            name: examMetaData.name as string,
            info: examMetaData.info as string,
            startTime: startTime as { _hex: string },
            endTime: endTime as { _hex: string },
          }
          setExamData(data)
        } catch (error) {
          console.error('Error fetching exam metadata:')
        }
      }
    }
    fetchData()
  }, [creator, examData, startTime, endTime, examAddress, examMetaDataLink])

  return <div>{examData && <Card {...examData} />}</div>
}

export default Exams
