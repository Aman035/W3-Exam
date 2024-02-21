import { ConnectButton } from '@rainbow-me/rainbowkit'
import React, { useEffect, useState } from 'react'
import 'react-dropzone-uploader/dist/styles.css'
import './CreateExam.scss'
import styled from 'styled-components'
import { generateRandomSecret } from '../../utils/aes'
import { useNavigate } from 'react-router-dom'
import { useSigner, useContract } from 'wagmi'
import { ethers } from 'ethers'
import { config } from '../../config'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import moment from 'moment'
import Toast from '../../components/Toast/Toast'
import axios from 'axios'
import { upload } from '@spheron/browser-upload'

function CreateExam() {
  const [loading, setLoading] = useState(false)
  const [stepFlow, setStepFlow] = useState(0)
  const [name, setName] = useState('') //examName
  const [info, setInfo] = useState('') //examInfo
  const [start, setStart] = useState<number | undefined>()
  const [end, setEnd] = useState<number | undefined>()
  const [file, setFile] = useState<File | null>(null) //questionFile
  const [secret, setSecret] = useState('') //file encryption aes key
  const [dragging, setDragging] = useState(false)
  const [examHash, setExamHash] = useState('')
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'warning'
  } | null>(null)

  const closeToast = () => {
    setToast(null)
  }

  const handleStartChange = (date: moment.Moment | string) => {
    const epoch = moment(date).valueOf()
    setStart(epoch)
  }

  const handleEndChange = (date: moment.Moment | string) => {
    const epoch = moment(date).valueOf()
    setEnd(epoch)
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
        setFile(selectedFile)
      } else {
        setToast({
          message: 'Please select a PDF file.',
          type: 'error',
        })
      }
    }
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0]
      // Ensure the file is a PDF
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
      } else {
        setToast({
          message: 'Please select a PDF file.',
          type: 'error',
        })
      }
    }
  }

  const handleFileUpload = async () => {
    setLoading(true)
    try {
      if (file && name !== '' && info !== '') {
        // -----------ENCRYPTING PDF-----------------------------
        const formData = new FormData()
        formData.append('File', file)
        formData.append('UserPassword', secret)
        formData.append('OwnerPassword', secret)
        let encryptedFile: Blob
        const response = await axios.post(
          `${config.convertAPIURL}?Secret=${config.convertAPIToken}&download=attachment`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob',
          }
        )
        encryptedFile = response.data
        // -----------ENCRYPTING PDF-----------------------------
        // -----------UPLOAD TO IPFS-----------------------------
        const examBlob = new Blob([JSON.stringify({ name, info })], {
          type: 'application/json',
        })
        const examDetailsFile = new File([examBlob], 'examDetails', {
          type: 'application/json',
        })
        const encryptedQuestionFile = new File(
          [encryptedFile],
          'questionPaper',
          {
            type: 'application/pdf',
          }
        )
        const uploadId = await uploadToIPFS([
          examDetailsFile,
          encryptedQuestionFile,
        ])
        setExamHash(uploadId)
        setLoading(false)
        setStepFlow(2)
      }
      // -----------UPLOAD TO IPFS-----------------------------
    } catch (err) {
      setLoading(false)
      setToast({
        message: 'Unable To Create Exam !!!\n Data Uploading Failed',
        type: 'error',
      })
    }
  }

  const { data: signerData } = useSigner()

  const examFactory = useContract({
    address: config.examFactoryAddress,
    abi: config.examFactoryABI,
    signerOrProvider: signerData,
  })

  const navigate = useNavigate()

  const handlecreateExam = async () => {
    setLoading(true)
    try {
      const amount = ethers.utils.parseEther('0.005') // or some other value
      const tx = await examFactory?.createExam(examHash, start, end, {
        value: amount,
      })
      await tx.wait()
      navigate('/exams')
    } catch (err) {
      setToast({
        message: 'Unable To Create Exam !!!\n Plz Check the connected wallet',
        type: 'error',
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    setSecret(generateRandomSecret(16))
  }, [])
  return (
    <div className="container">
      <div>
        <h1 className="title">Create your Exam!</h1>
        <h3 className="info">
          <b>Min W3 Exam</b> makes it extremely easy to create a decentralized
          exam which can be accessed by anyone easily.
        </h3>
      </div>
      <div className="createExam">
        <ConnectButton />
        <div className="tabContainer">
          <Tab
            active={stepFlow >= 0 ? true : false}
            // onClick={() => setStepFlow(0)}
          >
            <div>Exam Info</div>
            <Step type={stepFlow >= 0 ? true : false} />
          </Tab>
          <Tab
            active={stepFlow >= 1 ? true : false}
            // onClick={() => setStepFlow(1)}
          >
            <div>Upload File</div>
            <Step type={stepFlow >= 1 ? true : false} />
          </Tab>
          <Tab
            active={stepFlow >= 2 ? true : false}
            // onClick={() => setStepFlow(2)}
          >
            <div>Created Exam Info</div>
            <Step type={stepFlow >= 2 ? true : false} />
          </Tab>
        </div>
        {/* Exam Entry */}
        {stepFlow === 0 && (
          <>
            <div className="form-input">
              <label htmlFor="examName">Exam Name:</label>
              <input
                type="text"
                id="examName"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="form-input">
              <label htmlFor="examInfo">Exam Info:</label>
              <textarea
                id="examInfo"
                value={info}
                onChange={(event) => setInfo(event.target.value)}
              />
            </div>

            <div className="date-range-picker">
              <div className="picker-wrapper">
                <Datetime
                  value={start ? moment(start).toDate() : ''}
                  onChange={handleStartChange}
                  inputProps={{ placeholder: 'Start date/time' }}
                />
              </div>
              <div className="picker-wrapper">
                <Datetime
                  value={end ? moment(end).toDate() : ''}
                  onChange={handleEndChange}
                  inputProps={{ placeholder: 'End date/time' }}
                />
              </div>
            </div>

            {name !== '' && info !== '' && start && end && (
              <button className="next-button" onClick={() => setStepFlow(1)}>
                Next
              </button>
            )}
          </>
        )}

        {/* Image Upload Section */}
        {stepFlow === 1 && (
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
                <label style={{ marginRight: '5px' }}>Drag and Drop or</label>
                <label htmlFor="file-upload" className="browse-label">
                  Browse to Choose
                </label>
              </div>
              {file && <p>Selected file: {file.name}</p>}
            </div>
            {file && !loading && (
              <button className="next-button" onClick={handleFileUpload}>
                Encrypt & Upload
              </button>
            )}
            {loading && (
              <div className="loader">
                <div className="spinner"></div>
              </div>
            )}
          </>
        )}

        {/* Exam Setup Progress */}
        {stepFlow === 2 && (
          <>
            <div className="exam-details">
              <h2>Exam Details</h2>
              <div className="details-container">
                <div className="detail">
                  <label>Name:</label>
                  <span>{name}</span>
                </div>
                <div className="detail">
                  <label>Info:</label>
                  <span>{info}</span>
                </div>
                <div className="detail">
                  <label>Exam Sheet:</label>
                  {file && <span>{file.name}</span>}
                </div>
                <div className="detail">
                  <label>Exam Sheet Password:</label>
                  <span>{secret}</span>
                </div>
              </div>
              <p className="note">
                <span>Note: </span>Please save the password and share it with
                the students at the start of the exam
              </p>
            </div>
            {!loading && (
              <button className="next-button" onClick={handlecreateExam}>
                Confirm & Transact
              </button>
            )}
            {loading && (
              <div className="loader">
                <div className="spinner"></div>
              </div>
            )}
          </>
        )}
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  )
}

interface TabProps {
  type?: boolean
  active?: boolean
}

// css styles
const Step = styled.div<TabProps>`
  height: 5px;
  width: 100%;
  background: #cfd7e4;
  border-radius: 13px;
  ${({ type }) => type && `background: #3898FF;`};
`

const Tab = styled.div<TabProps>`
  position: relative;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  margin: 0px 10px;
  color: #657795;

  div {
    margin: 5px 0px;
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
  }

  @media (max-width: 768px) {
    width: 100%;
    margin: 0px 4px;

    div {
      font-weight: 500;
      font-size: 15px;
    }
  }

  ${({ active }) =>
    active &&
    `
      color: #3898FF;
      @media (max-width: 768px) {
        width: 100%;
      }
    `};

  ${({ active }) =>
    !active &&
    `
      @media (max-width: 768px) {
        width: 40%;

        div {
          font-size: 0px;

          @media (max-width: 768px) {
          }
        }
      }
    `};
`

export default CreateExam
