import React, { useState } from 'react'
import { Icon } from '../components/Icon'
import { Media } from '../../api'

export const MediaOverlay = ({ patientId, appointmentId, children }) => {
  const [currentMediaId, setCurrentMediaId] = useState()

  const handleMediaClick = mediaId => {
    console.log('[Media] Viewing', mediaId)
    setCurrentMediaId(mediaId)
  }
  const handleClose = () => setCurrentMediaId(null)

  const currentMedia = currentMediaId && Media.findOne({ _id: currentMediaId })

  return <div>
    {
      currentMediaId && <div style={overlayStyle} onClick={handleClose}>
        <div style={closeStyle} onClick={handleClose}>
          <Icon name='times' />

          {currentMedia && <img src={currentMedia.url} />}
        </div>
      </div>
    }
    {children({ handleMediaClick })}
  </div>
}

const overlayStyle = {
  position: 'fixed',
  zIndex: 1080,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.85)',
  color: 'white'
}

const closeStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  opacity: 0.5,
  width: 80,
  height: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
}
