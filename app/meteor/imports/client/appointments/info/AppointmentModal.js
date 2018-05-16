import React from 'react'
import { Modal } from 'react-bootstrap'
import Button from 'material-ui/Button'
import { AppointmentInfoContainer } from './AppointmentInfoContainer'
import { AppointmentActionsContainer } from './AppointmentActionsContainer'
import { PastAppointmentsContainer } from '../../patients/PastAppointmentsContainer'

export const AppointmentModal = (props) => {
  const {
    appointmentId,
    onStartMove,
    onSetAdmitted,
    show,
    onClose,
    viewInCalendar,
    comments,
    patient
  } = props

  const Actions = () =>
    <Modal.Footer style={{ backgroundColor: '#fcfcfc' }}>
      <AppointmentActionsContainer
        appointmentId={appointmentId}
        onStartMove={onStartMove}
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
        <AppointmentInfoContainer {...props} />
      </Modal.Body>

      <Actions />

      {
        patient &&
          <div className='row' style={{ marginTop: -5 }}>
            <div className='col-md-12'>
              <PastAppointmentsContainer
                patientId={patient._id}
                currentAppointmentId={appointmentId}
                appendIfMany={<Actions />} />
            </div>
          </div>
      }
    </Modal>
  )
}
