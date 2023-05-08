import React, { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useParams } from 'react-router-dom'
import { config } from '../../config'
import 'react-datetime/css/react-datetime.css'
import Toast from '../../components/Toast/Toast'
import { readContracts, useContract, useSigner, useAccount } from 'wagmi'
import { readContract } from '@wagmi/core'
import { CIDString, Web3Storage } from 'web3.storage'
import './EachExam.scss'
import EnrollForm from '../../components/EnrollForm/EnrollForm'
import SHA from 'sha.js'
import { QRCodeDisplay } from '../../components/QRCode/QRCode'

interface ExamStatsData {
  name: string
  sheet: File | null
  verified: boolean
}

function EachExam() {
  const [isLoading, setLoading] = useState(true)
  const [isEnrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const { examId }: any = useParams()
  const [examData, setExamData] = useState<any>({
    address: examId,
    creator: '',
    name: '',
    info: '',
    examSheet: null,
    startTime: '',
    endTime: '',
  })
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'warning'
  } | null>(null)
  const [file, setFile] = useState<File | null>(null) //answerFile
  const [dragging, setDragging] = useState(false)
  const [examTime, setExamTime] = useState(false)
  const [examOver, setExamOver] = useState(false)
  const [sheetHash, setSheetHash] = useState('')
  const [enrolledStudents, setEnrolledStudents] = useState([])

  const closeToast = () => {
    setToast(null)
  }

  const { data: signerData } = useSigner()
  const { address, isConnected } = useAccount()

  const getExamData = async () => {
    const examContract = {
      address: examId,
      abi: config.examABI,
    }
    const examDetails: any = await readContracts({
      contracts: [
        {
          ...examContract,
          functionName: 'creator',
        },
        {
          ...examContract,
          functionName: 'examData',
        },
        {
          ...examContract,
          functionName: 'startTime',
        },
        {
          ...examContract,
          functionName: 'endTime',
        },
      ],
    })
    const client = new Web3Storage({
      token: process.env.REACT_APP_WEB3_STORAGE_TOKEN!,
    })
    const res = await client.get(examDetails[1] as CIDString)
    const files = await res?.files()
    const examMeta = await files![0].arrayBuffer()
    const uint8Array = new Uint8Array(examMeta)
    const jsonStr = new TextDecoder().decode(uint8Array)
    const jsonObj = JSON.parse(jsonStr)
    const start = parseInt(examDetails[2]._hex, 16)
    const end = parseInt(examDetails[3]._hex, 16)
    const startDateTime = new Date(start)
    const endDateTime = new Date(end)
    const data = {
      address: examId,
      creator: examDetails[0],
      name: jsonObj.name,
      info: jsonObj.info,
      examSheet: files![1],
      startTime: startDateTime,
      endTime: endDateTime,
    }
    setExamData(data)
  }

  const getEnrollmentStatus = async () => {
    const data = await readContract({
      address: examId,
      abi: config.examABI,
      functionName: 'isEnrolled',
      args: [address],
    })
    setEnrolled(data as boolean)
  }

  const getEnrolledStudents = async () => {
    const enrolled: any = await readContract({
      address: examId,
      abi: config.examABI,
      functionName: 'getEnrolledStudents',
    })

    let data: any = []
    enrolled.map(async (each: any) => {
      const client = new Web3Storage({
        token: process.env.REACT_APP_WEB3_STORAGE_TOKEN!,
      })
      const metaCID = await client.get(each[1] as CIDString)
      const metaFile = await metaCID?.files()
      const studentMeta: any = await metaFile![0].arrayBuffer()
      const uint8Array = new Uint8Array(studentMeta)
      const jsonStr = new TextDecoder().decode(uint8Array)
      const jsonObj = JSON.parse(jsonStr)
      let verified = false

      let sheet: File | null = null
      try {
        const sheetCID = await client.get(each[3] as CIDString)
        const sheetFile = await sheetCID?.files()
        sheet = sheetFile![0]

        // generate hash and check
        const hash = SHA('sha256')
        const dataBuffer = await readFileAsBuffer(sheet)
        hash.update(dataBuffer)
        const studentSheetHash = hash.digest('hex')
        if (studentSheetHash === each[2]) verified = true
      } catch (err) {
        // do nothing as sheet is not found
      }

      data.push({
        name: jsonObj.name as string,
        sheet: sheet,
        verified: verified,
      })
    })

    setEnrolledStudents(data as any)
  }

  useEffect(() => {
    getExamData()
    setLoading(false)
  }, [])

  useEffect(() => {
    getEnrolledStudents()
  }, [])

  const handleDownload = (fileToBeDownloaded: File) => {
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(fileToBeDownloaded)
    anchor.download = fileToBeDownloaded.name
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  useEffect(() => {
    if (isConnected) {
      getEnrollmentStatus()
    }
  }, [address])

  const examContract = useContract({
    address: examId,
    abi: config.examABI,
    signerOrProvider: signerData,
  })

  const enrollInExam = async () => {
    try {
      setEnrolling(true)
      // -----------UPLOAD TO IPFS-----------------------------
      const client = new Web3Storage({
        token: process.env.REACT_APP_WEB3_STORAGE_TOKEN!,
      })
      const enrollBlob = new Blob([JSON.stringify(enrollData)], {
        type: 'application/json',
      })
      const enroll = {
        name: enrollData.name,
        type: 'application/json',
        stream: () => enrollBlob.stream(),
      }
      const hash = await client.put([enroll])
      // -----------UPLOAD TO IPFS-----------------------------
      // -----------CONTRACT CALL-----------------------------
      const tx = await examContract?.enroll(hash)
      await tx.wait()
      setEnrolling(false)
      setEnrolled(true)
    } catch (err) {
      setToast({
        message: 'Unable To Enroll in Exam !!!',
        type: 'error',
      })
      console.log(err)
    }
  }

  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollData, setEnrollData] = useState({ name: '', phone: '' }) // Example enroll data fields

  const handleEnroll = () => {
    setShowEnrollModal(true) // Show the enroll modal
  }
  const handleCloseEnrollForm = () => {
    setShowEnrollModal(false) // Show the enroll modal
  }

  const handleEnrollSubmit = async (e: any) => {
    e.preventDefault()
    await enrollInExam()
    setShowEnrollModal(false) // Hide the enroll modal after submission
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFile(event.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
    }
  }

  function readFileAsBuffer(file: File): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataBuffer = Buffer.from(reader.result as ArrayBuffer)
        resolve(dataBuffer)
      }
      reader.onerror = () => {
        reject(reader.error)
      }
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileHash = async (fileToBeHashed: File) => {
    if (!fileToBeHashed) {
      throw new Error('File is null or undefined')
    }
    const hash = SHA('sha256')
    const dataBuffer = await readFileAsBuffer(fileToBeHashed)
    hash.update(dataBuffer)
    setSheetHash(hash.digest('hex'))
  }

  const handleFileUpload = async () => {
    try {
      if (!file) {
        throw new Error('No File Found')
      }
      setLoading(true)
      // -----------UPLOAD TO IPFS-----------------------------
      const client = new Web3Storage({
        token: process.env.REACT_APP_WEB3_STORAGE_TOKEN!,
      })
      const filelike = {
        name: file.name,
        type: 'text/plain',
        stream: () => file.stream(),
      }
      const hash = await client.put([filelike])
      // -----------UPLOAD TO IPFS-----------------------------
      // -----------CONTRACT CALL-----------------------------
      const tx = await examContract?.addSheet(hash)
      await tx.wait()
      setLoading(false)
    } catch (err) {
      setToast({
        message: 'Unable To Submit Answer Sheet in Exam !!!',
        type: 'error',
      })
      console.log(err)
    }
  }

  // Function to render each card
  const renderCard = (cardData: ExamStatsData) => {
    return (
      <div className="exam-card" key={cardData.name}>
        <div className="exam-name">{cardData.name}</div>
        {cardData.sheet && (
          <button
            className="answer-sheet-button"
            onClick={() => handleDownload(cardData.sheet as File)}
          >
            Answer Sheet
          </button>
        )}
        <div
          className={`label ${cardData.verified ? 'verified' : 'unverified'}`}
        >
          {cardData.verified ? 'Sheet Verified' : 'Sheet Unverified'}
        </div>
      </div>
    )
  }

  // Function to group the cards in each row
  const groupCards = (cards: ExamStatsData[], size: number) => {
    const groups = []
    for (let i = 0; i < cards.length; i += size) {
      groups.push(cards.slice(i, i + size))
    }
    return groups
  }

  // Render the grouped cards
  const renderGroupedCards = () => {
    const groupedCards = groupCards(enrolledStudents, 3) // Grouping the cards in rows of 3
    return groupedCards.map((cardGroup, index) => {
      return (
        <div className="exam-card-row" key={index}>
          {cardGroup.map((card) => {
            return renderCard(card)
          })}
        </div>
      )
    })
  }

  useEffect(() => {
    if (examData.startTime !== '' && examData.endTime !== '') {
      const interval = setInterval(() => {
        const currentTime = new Date().getTime()
        if (
          currentTime >= examData.startTime.getTime() &&
          currentTime <= examData.endTime.getTime()
        ) {
          setExamTime(true)
        } else {
          setExamTime(false)
        }

        if (currentTime > examData.endTime.getTime()) {
          setExamOver(true)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [examData.startTime, examData.endTime])

  return (
    <div className="exam-data-container">
      <h1>{examData.name}</h1>
      <p>{examData.info}</p>
      <div className="connect">
        <ConnectButton />
      </div>
      <p>
        <strong>Address:</strong> {examData.address}
      </p>
      <p>
        <strong>Creator:</strong> {examData.creator}
      </p>
      <p>
        <strong>Start Time:</strong> {examData.startTime.toLocaleString()}
      </p>
      <p>
        <strong>End Time:</strong> {examData.endTime.toLocaleString()}
      </p>
      <button
        className="download-button"
        onClick={() => handleDownload(examData.examSheet)}
      >
        Download Exam Sheet
      </button>
      {isConnected && !isEnrolled && (
        <button className="enroll-button" onClick={handleEnroll}>
          Enroll In Exam
        </button>
      )}

      {showEnrollModal && (
        <EnrollForm
          enrollData={enrollData}
          enrolling={enrolling}
          handleEnrollSubmit={handleEnrollSubmit}
          setEnrollData={setEnrollData}
          handleCloseEnrollForm={handleCloseEnrollForm}
        />
      )}

      {isEnrolled && (
        <>
          <div
            className={`upload-pdf ${dragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div className="label-container">
              <label style={{ marginRight: '5px' }}>
                Add Answer Sheet - Drag and Drop or
              </label>
              <label htmlFor="file-upload" className="browse-label">
                Browse to Choose
              </label>
            </div>
            {file && <p>Selected Answer file: {file.name}</p>}
          </div>
          {file && examTime && (
            <>
              {sheetHash === '' && (
                <button
                  className="next-button"
                  onClick={() => handleFileHash(file)}
                >
                  Generate Sheet Hash
                </button>
              )}
              {sheetHash !== '' && (
                <div>
                  <QRCodeDisplay hash={sheetHash} />
                  <p>Note: SMS this hash to this no. - xxxx</p>
                </div>
              )}
            </>
          )}
          {file && examOver && !isLoading && (
            <button className="next-button" onClick={handleFileUpload}>
              Upload Answer Sheet
            </button>
          )}
          {isLoading && (
            <div className="loader">
              <div className="spinner"></div>
            </div>
          )}
        </>
      )}
      <div className="exam-stats">
        <h2>Exam Stats</h2>
        <div className="exam-card-container">{renderGroupedCards()}</div>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  )
}

export default EachExam
