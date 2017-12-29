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
      {
        comments.length > 4 &&
          <Modal.Footer>
            <Actions />
          </Modal.Footer>
      }
      {
        patient &&
          <div className='row'>
            <div className='col-md-12'>
              <CommentsContainer docId={patient._id} />
            </div>
          </div>
      }
      <Modal.Footer>
        <Actions />
      </Modal.Footer>
    </Modal>
  )
}
