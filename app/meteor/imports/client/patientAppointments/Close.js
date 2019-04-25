import React from 'react'
import injectSheet from 'react-jss'

const closeButtonStyle = {
  closeButton: {
    zIndex: 4,
    position: 'absolute',
    borderRadius: `0 4px 0 0`,
    top: 0,
    right: 0,
    width: 41,
    height: 35,
    fontSize: '20px',
    padding: 4,
    textAlign: 'center',
    color: 'rgba(128,128,128,0.4)',
    borderLeft: '1px solid rgba(128,128,128,0)',
    borderBottom: '1px solid rgba(128,128,128,0)',
    cursor: 'pointer',
    '&:hover': {
      color: 'rgba(128,128,128,0.8)',
      borderLeft: '1px solid rgba(128,128,128,0.1)',
      borderBottom: '1px solid rgba(128,128,128,0.1)',
      backgroundColor: 'rgba(128,128,128,0.05)'
    }
  }
}

export const Close = injectSheet(closeButtonStyle)(({ classes, onClick }) =>
  <div className={classes.closeButton} onClick={onClick}>×</div>
)
