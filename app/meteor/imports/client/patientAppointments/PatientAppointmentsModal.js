import React, { useRef, useEffect } from 'react'
import { Portal } from 'react-portal'
import { Appointments } from './Appointments'
import { AppointmentActionsContainer } from '../appointments/info/AppointmentActionsContainer'
import { background, modalBackground, lightBackground, mutedSeparator, mutedBackground, darkerMutedBackground } from '../layout/styles'
import Paper from '@material-ui/core/Paper'
import { Close } from './Close'
import { Patient } from './Patient'
import { ErrorBoundary } from '../layout/ErrorBoundary'
import Button from '@material-ui/core/Button'
import { __ } from '../../i18n'
import { Clients } from '../../api'
import { getClientKey } from '../../startup/client/native/events'
import { MediaOverlay } from '../media/Overlay'
import { DropZone } from './DropZone'
import { insertMedia } from '../../startup/client/dataTransfer'
import { HotKeys } from 'react-hotkeys'

export const PatientAppointmentsModal = ({ loading, show, ref, ...props }) => {
  const modalRef = useRef(null)
  useEffect(() => {
    // Associate client workstation with current patient
    setTimeout(() => {
      const clientKey = getClientKey()
      if (clientKey) {
        Clients.actions.setNextMedia.callPromise({
          clientKey,
          patientId: ((show && props.patientId) || null),
          appointmentId: ((show && props.appointmentId) || null),
          cycle: ((show && props.cycle) || null),
          tagIds: []
        })
      }
    }, 16)

    // Focus modal
    if (show) {
      setTimeout(() => {
        if (modalRef.current) {
          console.log('PAM focusing')
          modalRef.current.focus()
        } else {
          console.log('PAM wanted to focus, but no current ref')
        }
      }, 16)
    }
  }, [show, props.appointmentId, props.patientId])

  const handleClose = e => {
    console.log('PAM handleClose called (', e)
    props.onClose(e)
  }

  return (
    <MediaOverlay
      patientId={props.patientId}
      appointmentId={props.currentAppointment && props.currentAppointment._id}
    >
      {({ handleMediaClick }) =>
        <Portal>
          {
            <div className='disable-select' style={show ? modalStyle : hiddenStyle}>
              <div
                style={backdropStyle}
                onClick={handleClose}
              />
              <DropZone onDrop={f => insertMedia({ ...f, patientId: props.patientId })}>
                {({ ref, droppingStyle, isDropping }) =>
                  <Paper elevation={10} style={modalWindowStyle}>
                    <HotKeys handlers={{ CLOSE: handleClose }} innerRef={modalRef} style={containerOuterStyle}>
                      <Close onClick={handleClose} />
                      <div style={containerStyle} ref={ref}>
                        <div style={columnsStyle}>
                          <div style={appointmentsStyle}>
                            <ErrorBoundary name='PAM Appointments'>
                              <Appointments
                                {...props}
                                show={show}
                                handleMediaClick={handleMediaClick}
                                appointmentsCount={(
                                  (props.pastAppointmentsWithFloatingMedia ? props.pastAppointmentsWithFloatingMedia.length : 0) +
                                  (props.pastAppointments ? props.pastAppointments.length : 0) +
                                  (props.futureAppointments ? props.futureAppointments.length : 0) +
                                  (props.currentAppointment ? 1 : 0)
                                )} // Scrolls to bottom when changed
                              />
                            </ErrorBoundary>
                          </div>
                          <div style={patientSidebarStyle}>
                            <ErrorBoundary name='PAM Patient'>
                              <Patient {...props} handleMediaClick={handleMediaClick} />
                            </ErrorBoundary>
                          </div>
                        </div>
                        <div style={actionsStyle}>
                          <AppointmentActionsContainer {...props} />
                        </div>
                      </div>
                      {isDropping && <div style={droppingStyle} />}
                    </HotKeys>
                  </Paper>
                }
              </DropZone>
            </div>
          }
        </Portal>
      }
    </MediaOverlay>
  )
}

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
  maxHeight: 'calc(90% - 75px)' // Keep clearance on top and bottom
}

const containerOuterStyle = {
  height: '100%'
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
  zIndex: 2,
  boxShadow: '-4px 0px 5px -1px rgba(0,0,0,0.1)',
  width: 'calc(100% - 67%)', // More obvious to replace with Cmd+F
  overflow: 'auto',
  overscrollBehavior: 'contain',
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
  opacity: 0.8
}
