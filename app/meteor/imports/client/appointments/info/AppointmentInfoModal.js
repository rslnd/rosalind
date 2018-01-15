import React from 'react'
import { Modal } from 'react-bootstrap'
import { TAPi18n } from 'meteor/tap:i18n'
import FlatButton from 'material-ui/FlatButton'
import { AppointmentInfo } from './AppointmentInfo'
import { AppointmentActionsContainer } from './AppointmentActionsContainer'
import { PastAppointmentsContainer } from '../../patients/PastAppointmentsContainer'

export const AppointmentInfoModal = (props) => {
  const { appointmentId, onStartMove, show, onClose, viewInCalendar, comments, patient } = props

  const Actions = () => <AppointmentActionsContainer
    appointmentId={appointmentId}
    onStartMove={onStartMove}
    onClose={onClose}
    viewInCalendar={viewInCalendar} />

  return (
    <Modal
      show={show}
      onHide={onClose}
      enforceFocus={false}
      animation={false}
      bsSize='large'>
      <Modal.Body>
        <AppointmentInfo {...props} />
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: '#fcfcfc' }}>
        <Actions />
      </Modal.Footer>

      {
        patient &&
          <div className='row' style={{ marginTop: -5 }}>
            <div className='col-md-12'>
              <PastAppointmentsContainer
                patientId={patient._id}
                currentAppointmentId={appointmentId} />
            </div>
          </div>
      }
    </Modal>
  )
}
