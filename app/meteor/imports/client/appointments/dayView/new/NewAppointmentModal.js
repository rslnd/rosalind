import React from 'react'
import { Modal } from 'react-bootstrap'
import { NewAppointmentContainer } from '../../new/NewAppointmentContainer'

export const NewAppointmentModal = ({ open, onClose, calendar, assigneeId, time }) => (
  <Modal
    show={open}
    onHide={onClose}
    enforceFocus={false}
    animation={false}
    bsSize='large'>
    <Modal.Body>
      <NewAppointmentContainer
        calendar={calendar}
        assigneeId={assigneeId}
        time={time}
        onClose={onClose} />
    </Modal.Body>
    {/* <Modal.Footer>
        <Actions />
    </Modal.Footer> */}
  </Modal>
)
