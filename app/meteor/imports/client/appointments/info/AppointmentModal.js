import React from 'react'
import Modal from 'react-bootstrap/lib/Modal'
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

  const Actions = () =>
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
    </Modal> || null
  )
}
