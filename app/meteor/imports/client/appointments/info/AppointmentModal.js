import React from 'react'
import { Modal } from '../../components/bootstrap'
import { AppointmentInfoContainer } from './AppointmentInfoContainer'
import { AppointmentActionsContainer } from './AppointmentActionsContainer'
import { PastAppointmentsContainer } from '../../patients/PastAppointmentsContainer'
import { Loading } from '../../components/Loading'

export const AppointmentModal = (props) => {
  const {
    isLoading,
    appointmentId,
    onMoveStart,
    onSetAdmitted,
    show,
    onClose,
    viewInCalendar,
    comments,
    patient
  } = props

  // Element, not a component defined inline: a new component type on every
  // render would remount the footer and reset the "..." menu state
  const actions =
    <Modal.Footer style={{ backgroundColor: '#fcfcfc' }}>
      <AppointmentActionsContainer
        appointmentId={appointmentId}
        onMoveStart={onMoveStart}
        onClose={onClose}
        viewInCalendar={viewInCalendar}
        onSetAdmitted={onSetAdmitted} />
    </Modal.Footer>

  return (
    <Modal
      show={show}
      onHide={onClose}
      enforceFocus={false}
      animation={false}
      bsSize='large'>
      <Modal.Body>
        {
          isLoading && <Loading />
        }
        {
          show && <AppointmentInfoContainer {...props} />
        }
      </Modal.Body>

      {actions}

      {
        patient &&
          <div className='row' style={{ marginTop: -5 }}>
            <div className='col-md-12'>
              <PastAppointmentsContainer
                patientId={patient._id}
                currentAppointmentId={appointmentId}
                appendIfMany={actions} />
            </div>
          </div>
      }
    </Modal> || null
  )
}
