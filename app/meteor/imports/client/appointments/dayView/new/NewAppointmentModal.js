import React from 'react'
import Modal from 'react-bootstrap/lib/Modal'
import injectSheet from 'react-jss'
import { NewAppointmentContainer } from '../../new/NewAppointmentContainer'

const modalStyle = {
  modal: {
    minWidth: 550,
    maxWidth: '90%'
  }
}

const innerStyle = {
  padding: 10
}

export const NewAppointmentModal = injectSheet(modalStyle)(({ open, onClose, calendar, assigneeId, start, end, classes }) => (
  <Modal
    show={open}
    onHide={onClose}
    enforceFocus={false}
    animation={false}
    dialogClassName={classes.modal}>
    <div style={innerStyle}>
      <NewAppointmentContainer
        calendar={calendar}
        assigneeId={assigneeId}
        start={start}
        end={end}
        onClose={onClose} />
    </div>
  </Modal>
))
