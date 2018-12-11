import React from 'react'
import { compose, withState, nest, mapProps, withProps, withHandlers, renderComponent } from 'recompose'
import Paper from '@material-ui/core/Paper'
import { ErrorBoundary } from '../layout/ErrorBoundary'

const triggerStyle = {
  position: 'fixed',
  right: 0,
  top: 0,
  bottom: 0,
  width: 20,
  zIndex: 1061
}

const closeTriggerStyle = {
  position: 'fixed',
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
  zIndex: 1060
}

const drawerStyle = {
  position: 'fixed',
  right: 0,
  top: 0,
  bottom: 0,
  width: 800,
  zIndex: 1062,
  paddingTop: 15,
  paddingLeft: 15,
  paddingRight: 15,
  paddingBottom: 0
}

// Apparently { display: 'none' } resets state of children
const hiddenStyle = {
  opacity: 0,
  pointerEvents: 'none'
}

const DrawerComponent = ({ isOpen, handleOpen, handleClose, children = null }) =>
  <div
    style={triggerStyle}
    onMouseEnter={handleOpen}
  >
    <div
      style={isOpen ? closeTriggerStyle : hiddenStyle}
      onMouseEnter={handleClose}
    />
    <Paper
      elevation={10}
      square
      style={isOpen ? drawerStyle : hiddenStyle}
    >
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </Paper>
  </div>

export const Drawer = compose(
  withState('isOpen', 'setOpen', false),
  withHandlers({
    handleOpen: props => e => props.setOpen(true),
    handleClose: props => e => props.setOpen(false)
  })
)(DrawerComponent)

export const withDrawer = Component => props =>
  <Drawer>
    <Component {...props} />
  </Drawer>
