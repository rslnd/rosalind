import React from 'react'
import { Modal } from 'react-bootstrap'
import { AppointmentInfoContainer } from './AppointmentInfoContainer'
import { AppointmentActionsContainer } from './AppointmentActionsContainer'

export const AppointmentInfoModal = ({ appointmentId, onStartMove, show, onClose }) => (
  <Modal
    show={show}
    onHide={onClose}
    enforceFocus={false}
    animation={false}
    bsSize="large">
    <Modal.Body>
      <AppointmentInfoContainer
        appointmentId={appointmentId}
        onClose={onClose} />
    </Modal.Body>
    <Modal.Footer>
      <AppointmentActionsContainer
        appointmentId={appointmentId}
        onStartMove={onStartMove}
        onClose={onClose} />
    </Modal.Footer>
  </Modal>
)
