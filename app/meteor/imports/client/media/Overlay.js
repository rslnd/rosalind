import React, { useState, useRef } from 'react'
import { compose, withState } from 'recompose'
import { Icon } from '../components/Icon'
import { Media } from '../../api'
import { Sidebar } from './Sidebar'
import { withTracker } from '../components/withTracker'

export const MediaOverlay = compose(
  withState('currentMediaId', 'setCurrentMediaId'),
  withTracker(props => ({
    ...props,
    currentMedia: props.currentMediaId && Media.findOne({ _id: props.currentMediaId })
  }))
)(({ patientId, appointmentId, currentMedia, currentMediaId, setCurrentMediaId, children }) => {
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
      ref.current.style.transform = imageTransform({
        zoomed: (overrideZoomed === null ? zoomed : overrideZoomed),
        mediaHeight: currentMedia.height,
        mediaWidth: currentMedia.width,
        mouseX: e.nativeEvent.clientX,
        mouseY: e.nativeEvent.clientY,
        rotation: currentMedia.rotation
      })
    }
  }

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

        <div
          style={zoomed ? zoomedSidebarStyle : sidebarStyle}
          onClick={stopPropagation}
        >
          <Sidebar
            patientId={patientId}
            appointmentId={appointmentId}
            media={currentMedia}
            setCurrentMediaId={setCurrentMediaId}
          />
        </div>

        {currentMedia &&
          <div style={fitToScreen}>
            <img
              ref={ref}
              onClick={toggleZoom}
              src={currentMedia.url}
              style={imgStyle({
                zoomed,
                rotation: currentMedia.rotation,
                mediaWidth: currentMedia.width,
                mediaHeight: currentMedia.height
              })} />
          </div>
        }
      </div>
    }
    {children({ handleMediaClick })}
  </div>
})

const stopPropagation = e => e.stopPropagation()

const overlayStyle = {
  position: 'fixed',
  zIndex: 1080,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.85)',
  color: 'white',
  display: 'flex'
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
  justifyContent: 'center',
  padding: 30
}

const imgStyle = ({ zoomed, rotation, mediaWidth, mediaHeight }) => ({
  maxWidth: '100%',
  maxHeight: '100%',
  cursor: zoomed ? 'zoom-out' : 'zoom-in',
  transition: 'transform 300ms cubic-bezier(0.1, 0.81, 0.24, 1)',
  transform: imageTransform({ zoomed, rotation, mediaWidth, mediaHeight })
})

const imageTransform = ({ zoomed, mouseX, mouseY, mediaWidth, mediaHeight, rotation = 0 }) => {
  if (!zoomed) { return `rotate(${rotation}deg)` }

  const tX = (((window.innerWidth / 2) - mouseX) * 2) + 'px'
  const tY = (((window.innerHeight / 2) - mouseY) * 2) + 'px'

  const transform = `
    translateX(${tX})
    translateY(${tY})
    translateZ(0)
    scale(2)
    rotate(${rotation}deg)`

  return transform
}

const sidebarStyle = {
  width: 280,
  height: '100%',
  marginRight: 30,
  transition: 'opacity 150ms cubic-bezier(0.1, 0.81, 0.24, 1)'
}

const zoomedSidebarStyle = {
  ...sidebarStyle,
  opacity: 0.6
}
