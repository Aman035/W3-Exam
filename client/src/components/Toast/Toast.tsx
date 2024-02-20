import React, { useState, useEffect } from 'react'
import './Toast.scss'

type ToastType = 'error' | 'warning' | 'success'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timeout = setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 3000)

    return () => clearTimeout(timeout)
  }, [onClose])

  return (
    <div className={`toast ${isVisible ? 'visible' : ''} ${type}`}>
      <span>{message}</span>
    </div>
  )
}

export default Toast
