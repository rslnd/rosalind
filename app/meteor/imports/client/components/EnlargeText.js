import React from 'react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'

const largeStyle = {
  fontSize: 70,
  letterSpacing: 8,
  textAlign: 'center',
  fontWeight: 'bold',
  display: 'block',
  paddingTop: 40,
  paddingBottom: 40,
  color: '#dedede'
}

const modalStyle = {
  pointerEvents: 'none',
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(52, 52, 52, 0.8)',
  zIndex: 1060
}

const CustomModal = ({ children, onHide }) => (
  <div onMouseLeave={onHide} style={modalStyle}>
    <div style={largeStyle} className='enable-select'>
      {children}
    </div>
  </div>
)

export const EnlargeText = ({ children, iconOnly, style, value, icon = 'search-plus' }) => {
  const [show, setShow] = useState(false)

  return (
    <span>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}>
        {
          !iconOnly && children
        }

        {
          icon &&
            <span className='pull-right text-muted' style={{ ...style, cursor: 'pointer' }}>
              <Icon name={icon} />
            </span>
        }
      </span>

      {
        show && createPortal(
          <CustomModal onHide={() => setShow(false)}>
            {value || children}
          </CustomModal>,
          document.body
        )
      }
    </span>
  )
}
