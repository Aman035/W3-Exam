import React, { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useParams } from 'react-router-dom'
import { config } from '../../config'
import 'react-datetime/css/react-datetime.css'
import Toast from '../../components/Toast/Toast'
import { useContract, useSigner, useAccount, useContractRead } from 'wagmi'
import { signMessage } from '@wagmi/core'
import './EachExam.scss'
import EnrollForm from '../../components/EnrollForm/EnrollForm'
import SHA from 'sha.js'
import { QRCodeDisplay } from '../../components/QRCode/QRCode'
import axios from 'axios'
import { upload } from '@spheron/browser-upload'

interface ExamStudentData {
  name: string
  sheet: File | null
  verified: boolean
}

/**
 * Custom hook to read contract
 */
const useReadContract = (
  contractAddress: `0x${string}`,
  functionName: string,
  args: any[] = []
) => {
  const { data, isError, isLoading } = useContractRead({
    address: contractAddress,
    abi: config.examABI,
    functionName,
    args,
  })
  return { data, isError, isLoading }
}

function EachExam() {
  const { examId }: any = useParams()
  const [isLoading, setLoading] = useState(true)
  const [examData, setExamData] = useState<any>({
    address: examId,
    creator: '',
    name: '',
    info: '',
    examSheet: null,
    startTime: '',
    endTime: '',
  })
  const [enrolledStudents, setEnrolledStudents] = useState<ExamStudentData[]>(
    []
  )

  const [isEnrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [file, setFile] = useState<File | null>(null) //answerFile
  const [dragging, setDragging] = useState(false)
  const [examTime, setExamTime] = useState(false)
  const [examOver, setExamOver] = useState(false)
  const [sheetHash, setSheetHash] = useState('')

  const [password, setPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'warning'
  } | null>(null)
  const closeToast = () => {
    setToast(null)
  }

  /** EXAM DATA LOADING */
  const { data: creator } = useReadContract(examId, 'creator')
  const { data: examMetaDataLink } = useReadContract(examId, 'examData')
  const { data: startTime } = useReadContract(examId, 'startTime')
  const { data: endTime } = useReadContract(examId, 'endTime')

  useEffect(() => {
    const fetchData = async () => {
      if (examMetaDataLink) {
        try {
          const examMetaData = (
            await axios.get(`${examMetaDataLink}/examDetails`)
          ).data

          const questionPaper = (
            await axios.get(`${examMetaDataLink}/questionPaper`)
          ).data

          const data = {
            address: examId as `0x${string}`,
            creator: creator as `0x${string}`,
            name: examMetaData.name as string,
            info: examMetaData.info as string,
            examSheet: questionPaper as File,
            startTime: new Date(
              parseInt((startTime as { _hex: string })._hex, 16)
            ),
            endTime: new Date(parseInt((endTime as { _hex: string })._hex, 16)),
          }
          setExamData(data)
          setLoading(false)
        } catch (error) {
          console.error('Error fetching exam metadata:')
        }
      }
    }
    fetchData()
  }, [creator, examData, startTime, endTime, examMetaDataLink, examId])

  /** EXAM ENROLLMENT DATA LOADING  */
  const { data: enrolled } = useReadContract(examId, 'getEnrolledStudents')

  useEffect(() => {
    if (!enrolled) return

    let enrolledStudentData: {
      name: string
      sheet: File | null
      verified: boolean
    }[] = []

    ;(enrolled as []).map(async (each: any) => {
      const studentDetails = (await axios.get(`${each[1]}/studentDetails`)).data

      let verified = false
      let sheetFile: File | null = null
      try {
        sheetFile = (await axios.get(`${each[3]}/answerSheet`)).data
        // generate hash and check
        const hash = SHA('sha256')
        const dataBuffer = await readFileAsBuffer(sheetFile as File)
        hash.update(dataBuffer)
        const studentSheetHash = hash.digest('hex')
        if (studentSheetHash === each[2]) verified = true
      } catch (err) {
        // do nothing as sheet is not found
      }

      enrolledStudentData.push({
        name: studentDetails.name as string,
        sheet: sheetFile,
        verified: verified,
      })
    })

    setEnrolledStudents(enrolledStudentData)
  }, [enrolled])

  /** CURRENT USER ENROLLMENT STATUS */
  const { address, isConnected } = useAccount()
  const { data: isStudentEnrolled } = useReadContract(examId, 'isEnrolled', [
    address,
  ])

  useEffect(() => {
    if (isConnected) {
      setEnrolled(isStudentEnrolled as boolean)
    }
  }, [isConnected, isStudentEnrolled])

  /** CONTRACT TRX SETUP */
  const { data: signerData } = useSigner()
  const examContract = useContract({
    address: examId,
    abi: config.examABI,
    signerOrProvider: signerData,
  })

  const handleDownload = (fileContent: string) => {
    // Convert the file content string to a blob
    const blob = new Blob([fileContent], { type: 'application/pdf' })

    // Create a link element
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = 'questionPaper'

    // Append the link to the body and trigger the download
    document.body.appendChild(anchor)
    anchor.click()

    // Clean up
    document.body.removeChild(anchor)
    URL.revokeObjectURL(anchor.href)
  }

  const uploadToIPFS = async (files: File[]) => {
    const response = await fetch(
      `${config.backendURL}/api/ipfs/initiate-upload`
    )
    const resJson = await response.json()
    const token = resJson.uploadToken

    let currentlyUploaded = 0
    const { protocolLink } = await upload(files, {
      token,
      onChunkUploaded: (uploadedSize, totalSize) => {
        currentlyUploaded += uploadedSize
        console.log(`Uploaded ${currentlyUploaded} of ${totalSize} Bytes.`)
      },
    })
    return protocolLink
  }

  const enrollInExam = async () => {
    try {
      setEnrolling(true)
      // -----------UPLOAD TO IPFS-----------------------------
      const enrollBlob = new Blob([JSON.stringify(enrollData)], {
        type: 'application/json',
      })
      const enrolledStudentFile = new File([enrollBlob], 'studentDetails', {
        type: 'application/json',
      })
      const hash = await uploadToIPFS([enrolledStudentFile])
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
      console.error(err)
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
      const selectedFile = event.dataTransfer.files[0]
      // Ensure the file is a PDF
      if (selectedFile.type === 'application/pdf') {
        const renamedFile = new File([selectedFile], 'answerSheet', {
          type: selectedFile.type,
        })
        setFile(renamedFile)
      } else {
        setToast({
          message: 'Please select a PDF file.',
          type: 'error',
        })
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0]
      // Ensure the file is a PDF
      if (selectedFile.type === 'application/pdf') {
        const renamedFile = new File([selectedFile], 'answerSheet', {
          type: selectedFile.type,
        })
        setFile(renamedFile)
      } else {
        setToast({
          message: 'Please select a PDF file.',
          type: 'error',
        })
      }
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
    const currentFileHash = hash.digest('hex')
    const signature = await signMessage({ message: currentFileHash })
    setSheetHash(`SUBMIT ${currentFileHash} ${examData.address} ${signature}`)
  }

  const handleFileUpload = async () => {
    try {
      if (!file) {
        throw new Error('No File Found')
      }
      setLoading(true)
      // -----------UPLOAD TO IPFS-----------------------------
      const answerSheet = new File([file], 'answerSheet', {
        type: 'application/pdf',
      })
      const hash = await uploadToIPFS([answerSheet])
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
  const renderCard = (cardData: ExamStudentData) => {
    return (
      <div className="exam-card" key={cardData.name}>
        <div className="exam-name">{cardData.name}</div>
        {cardData.sheet && (
          <button
            className="answer-sheet-button"
            onClick={() => handleDownload(cardData.sheet as any as string)}
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
  const groupCards = (cards: ExamStudentData[], size: number) => {
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

  const handlePublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const signature = await signMessage({ message: password })
    setPasswordMsg(`PUBLISH ${password} ${examData.address} ${signature}`)
  }

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
      {isConnected && address === examData.creator && (
        <div className="pass">
          <form onSubmit={handlePublish}>
            <label className="pass">Exam Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="download-button" type="submit">
              Pushlish
            </button>
          </form>
          {passwordMsg !== '' && (
            <div>
              <QRCodeDisplay hash={passwordMsg} />
              <p>
                Note: Send SMS to +14155238886 to broadcast question sheet
                password to encrolled students
              </p>
            </div>
          )}
        </div>
      )}
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
                  <p>Note: Send SMS to +14155238886 to submit Sheet Hash</p>
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
