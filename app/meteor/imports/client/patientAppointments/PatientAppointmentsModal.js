import React from 'react'
import { Portal } from 'react-portal'
import { withPropsOnChange } from 'recompose'
import { Appointments } from './Appointments'
import { AppointmentActionsContainer } from '../appointments/info/AppointmentActionsContainer'
import { background, modalBackground, lightBackground, mutedSeparator, mutedBackground, darkerMutedBackground } from '../layout/styles'
import Paper from '@material-ui/core/Paper'
import { Close } from './Close'
import { Patient } from './Patient'
import { ErrorBoundary } from '../layout/ErrorBoundary'

export const PatientAppointmentsModal = withPropsOnChange(
  ['show'],
  props => {
    // Prevent page from scrolling while modal is open
    if (props.show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = null
    }
    return {}
  }
)(({ show, onClose, ...props }) =>
  <Portal>
    {
      <div className='disable-select' style={show ? modalStyle : hiddenStyle}>
        <div
          style={backdropStyle}
          onClick={onClose}
        />
        <Paper elevation={10} style={modalWindowStyle}>
          <Close onClick={onClose} />
          <div style={containerStyle}>
            <div style={columnsStyle}>
              <div style={appointmentsStyle}>
                <ErrorBoundary>
                  <Appointments {...props} show={show} />
                </ErrorBoundary>
              </div>
              <div style={patientSidebarStyle}>
                <ErrorBoundary>
                  <Patient {...props} />
                </ErrorBoundary>
              </div>
            </div>
            <div style={actionsStyle}>
              <AppointmentActionsContainer {...props} />
            </div>
          </div>
        </Paper>
      </div>
    }
  </Portal>
)

const borderRadius = 6

const hiddenStyle = {
  opacity: 0,
  pointerEvents: 'none'
}

const modalStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const backdropStyle = {
  background: modalBackground,
  position: 'fixed',
  height: '100%',
  width: '100%'
}

const modalWindowStyle = {
  position: 'fixed',
  flex: 1,
  background: background,
  borderRadius,
  width: '90%',
  maxWidth: 'calc(90% - 120px)', // Keep chat bubble visible
  height: '90%',
  maxHeight: 'calc(90% - 35px)' // Keep clearance on top and bottom
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
}

const columnsStyle = {
  flexGrow: 1,
  display: 'flex',
  height: '100%'
}

const appointmentsStyle = {
  width: '67%',
  height: '100%',
  background: darkerMutedBackground,
  borderRadius: `${borderRadius}px 0 0 0`
}

const patientSidebarStyle = {
  padding: 12,
  zIndex: 2,
  boxShadow: '-4px 0px 5px -1px rgba(0,0,0,0.1)',
  width: 'calc(100% - 67%)', // More obvious to replace with Cmd+F
  overflow: 'auto',
  backgroundColor: lightBackground,
  borderRadius: `0 ${borderRadius}px 0 0`
}

const actionsStyle = {
  height: 80,
  width: '100%',
  zIndex: 1,
  padding: 15,
  backgroundColor: mutedBackground,
  boxShadow: '0px -3px 5px -1px rgba(0,0,0,0.1)',
  borderTop: `1px solid ${mutedSeparator}`,
  borderRadius: `0 0 ${borderRadius}px ${borderRadius}px`
}
