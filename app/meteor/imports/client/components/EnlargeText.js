import React from 'react'
import { useState } from 'react'
import Overlay from 'react-bootstrap/lib/Overlay'
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

      <Overlay
        show={show}
        onHide={() => setShow(false)}
        enforceFocus={false}
        animation={false}
        backdrop={false}
        bsSize='large'>
        <CustomModal onHide={this.handleHide}>
          {value || children}
        </CustomModal>
      </Overlay>
    </span>
  )
}
