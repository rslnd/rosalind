import React, { useState, useRef } from 'react'
import { Icon } from '../components/Icon'
import { Media } from '../../api'

export const MediaOverlay = ({ patientId, appointmentId, children }) => {
  const [currentMediaId, setCurrentMediaId] = useState()
  const [zoomed, setZoomed] = useState()
  const ref = useRef(null)

  const handleMediaClick = mediaId => {
    console.log('[Media] Viewing', mediaId)
    setCurrentMediaId(mediaId)
  }
  const handleClose = () => setCurrentMediaId(null)
  const toggleZoom = e => {
    e.stopPropagation()
    setZoomed(!zoomed)
    handleMouseMove(e, !zoomed)
  }

  const handleMouseMove = (e, overrideZoomed = null) => {
    if (ref.current) {
      ref.current.style.transform = (overrideZoomed === null ? zoomed : overrideZoomed)
        ? imgZoomedStyle(e.nativeEvent.clientX, e.nativeEvent.clientY)
        : 'none'
    }
  }

  const currentMedia = currentMediaId && Media.findOne({ _id: currentMediaId })

  return <div>
    {
      currentMediaId && <div
        style={zoomed ? overlayZoomedStyle : overlayStyle}
        onClick={zoomed ? toggleZoom : handleClose}
        onMouseMove={zoomed ? handleMouseMove : null}
      >
        {
          !zoomed && <div style={closeStyle} onClick={handleClose}>
            <Icon name='times' />
          </div>
        }

        {currentMedia &&
          <div style={fitToScreen}>
            <img
              ref={ref}
              onClick={toggleZoom}
              src={currentMedia.url}
              style={zoomed ? imgStyleZoomed : imgStyle} />
          </div>
        }
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
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const overlayZoomedStyle = {
  ...overlayStyle,
  cursor: 'zoom-out'
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

const fitToScreen = {
  width: 'calc(100% - 200px)',
  height: 'calc(100% - 50px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const imgStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
  cursor: 'zoom-in',
  transition: 'transform 300ms cubic-bezier(0.1, 0.81, 0.24, 1)'
}

const imgStyleZoomed = {
  ...imgStyle,
  cursor: 'zoom-out'
}

const imgZoomedStyle = (mouseX, mouseY) => {
  const tX = (((window.innerWidth / 2) - mouseX) * 2) + 'px'
  const tY = (((window.innerHeight / 2) - mouseY) * 2) + 'px'
  const transform = `translateX(${tX}) translateY(${tY}) translateZ(0) scale(2)`
  return transform
}
