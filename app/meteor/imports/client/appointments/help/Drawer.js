import React from 'react'
import Paper from '@material-ui/core/Paper'

const triggerStyle = {
  position: 'fixed',
  right: 0,
  top: 0,
  bottom: 0,
  width: 5
}

const drawerStyle = {
  position: 'fixed',
  right: 0,
  top: 0,
  bottom: 0,
  width: 600,
  zIndex: 20,
  padding: 10
}

export const Drawer = ({ isOpen, setOpen, children }) =>
  <div
    style={triggerStyle}
    onMouseEnter={() => setOpen(true)}
  >
    {
      isOpen && <Paper
        elevation={10}
        square
        style={drawerStyle}
        onMouseLeave={() => setOpen(false)}>
        {children}
      </Paper>
    }
  </div>
