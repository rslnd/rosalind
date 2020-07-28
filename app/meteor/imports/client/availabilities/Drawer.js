import React, { useRef, useEffect } from 'react'
import Paper from '@material-ui/core/Paper'
import { ErrorBoundary } from '../layout/ErrorBoundary'
import { Icon } from '../components/Icon'
import { HotKeys, ObserveKeys } from 'react-hotkeys'

const triggerHeight = 220
const triggerContainerStyle = {
  position: 'fixed',
  right: -10,
  top: '50%',
  marginTop: triggerHeight / -2,
  height: triggerHeight,
  width: 33,
  zIndex: 1061
}

const triggerLatchStyle = {
  height: '100%',
  display: 'flex',
  justifyContent: 'space-evenly',
  flexDirection: 'column',
  backgroundColor: '#dbdddf'
}

const triggerLatchLabelStyle = {
  color: '#687e95',
  transform: 'rotate(-90deg) translateX(-10px) translateY(20px)',
  transformOrigin: 'left bottom 0',
  width: 50
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
  paddingBottom: 0,
  cursor: 'pointer'
}

const closeTriggerStyle = {
  position: 'fixed',
  top: 10,
  right: drawerStyle.width + 50,
  bottom: 10,
  left: 10,
  zIndex: 1060
}

// Apparently { display: 'none' } resets state of children
const hiddenStyle = {
  opacity: 0,
  pointerEvents: 'none'
}

const Drawer = ({ isOpen, handleOpen, handleClose, children = null }) => {
  const focusRef = useRef()
  useEffect(() => {
    if (isOpen) { focusRef.current.focus() }
  }, [isOpen])

  return <div className='hide-print'>
    <div
      style={triggerContainerStyle}
      onClick={handleOpen}
    >
      <Paper
        elevation={3}
        style={triggerLatchStyle}
      >
        <div style={triggerLatchLabelStyle}>
          <Icon name='life-ring' /> Hilfe
        </div>
      </Paper>
    </div>
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
        <HotKeys handlers={{ CLOSE: handleClose }} style={keepHeightStyle}>
          {/* Observe escape key even when search field is autofocused */}
          <ObserveKeys only={['Escape']} style={keepHeightStyle}>
            {children({ focusRef })}
          </ObserveKeys>
        </HotKeys>
      </ErrorBoundary>
    </Paper>
  </div>
}

const keepHeightStyle = {
  height: '100%'
}

export const withDrawer = Component => props => {
  const { handleDrawerOpen, handleDrawerClose, isDrawerOpen } = props
  return (
    <Drawer
      handleOpen={handleDrawerOpen}
      handleClose={handleDrawerClose}
      isOpen={isDrawerOpen}
    >
      {({ focusRef }) =>
        <Component
          focusRef={focusRef}
          {...props}
        />
      }
    </Drawer>
  )
}
