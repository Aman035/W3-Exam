import React from 'react'
import QRCode from 'qrcode.react'
import './QRCode.scss' // Import the CSS file

interface QRCodeProps {
  hash: string
}

export function QRCodeDisplay(props: QRCodeProps) {
  return (
    <div className="qr-code-container">
      <p>State sheet hash: {props.hash}</p>
      <div className="qr-code">
        <QRCode value={props.hash} />
      </div>
    </div>
  )
}
