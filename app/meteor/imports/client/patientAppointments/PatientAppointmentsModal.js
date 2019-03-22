import React from 'react'
import { Portal } from 'react-portal'
import { Appointments } from './Appointments'
import { AppointmentActionsContainer } from '../appointments/info/AppointmentActionsContainer'
import { background, modalBackground, darkGray, grayDisabled, darkGrayActive, sidebarBackground, gray, lightBackground, mutedSeparator, mutedBackground, darkerMutedBackground } from '../layout/styles'
import { Paper } from '@material-ui/core'
import injectSheet from 'react-jss'
import { Patient } from './Patient'

export const PatientAppointmentsModal = ({ show, onClose, ...props }) =>
  <Portal>
    {
      show && <div style={modalStyle}>
        <div
          style={backdropStyle}
          onClick={onClose}
        />
        <Paper elevation={10} style={modalWindowStyle}>
          <CloseButton onClick={onClose} />
          <div style={containerStyle}>
            <div style={columnsStyle}>
              <div style={appointmentsStyle}>
                <Appointments {...props} />
              </div>
              <div style={patientSidebarStyle}>
                <Patient />
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

const borderRadius = 6

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
  width: '85%',
  maxWidth: 'calc(85% - 120px)', // Keep chat bubble visible
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
  display: 'flex'
}

const appointmentsStyle = {
  width: '70%',
  height: '100%',
  background: darkerMutedBackground,
  borderRadius: `${borderRadius}px 0 0 0`
}

const patientSidebarStyle = {
  padding: 12,
  zIndex: 2,
  boxShadow: '-4px 0px 5px -1px rgba(0,0,0,0.1)',
  width: '30%',
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

const closeButtonStyle = {
  closeButton: {
    position: 'absolute',
    borderRadius: `0 ${borderRadius}px 0 0`,
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

const CloseButton = injectSheet(closeButtonStyle)(({ classes, onClick }) =>
  <div className={classes.closeButton} onClick={onClick}>×</div>
)
