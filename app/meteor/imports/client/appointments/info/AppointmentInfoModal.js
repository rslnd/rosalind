import React from 'react'
import { Modal } from 'react-bootstrap'
import { AppointmentInfo } from './AppointmentInfo'
import { AppointmentActionsContainer } from './AppointmentActionsContainer'
import { CommentsContainer } from '../../comments/CommentsContainer'

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
      <Modal.Footer>
        <Actions />
      </Modal.Footer>
    </Modal>
  )
}
