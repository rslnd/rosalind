
import React from 'react'
import { compose, withState, nest, mapProps, withProps, withHandlers, renderComponent } from 'recompose'
import Paper from '@material-ui/core/Paper'
import { ErrorBoundary } from '../../layout/ErrorBoundary'

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
  padding: 15
}

const DrawerComponent = ({ isOpen, handleOpen, handleClose, children = null }) =>
  <div
    style={triggerStyle}
    onMouseEnter={handleOpen}
  >
    {
      isOpen && <Paper
        elevation={10}
        square
        style={drawerStyle}
        onMouseLeave={handleClose}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </Paper>
    }
  </div>

export const Drawer = compose(
  withState('isOpen', 'setOpen', false),
  withHandlers({
    handleOpen: props => e => props.setOpen(true),
    handleClose: props => e => props.setOpen(false)
  })
)(DrawerComponent)
