import React from 'react'
import { Modal } from 'react-bootstrap'
import injectSheet from 'react-jss'
import { NewAppointmentContainer } from '../../new/NewAppointmentContainer'

const modalStyle = {
  modal: {
    minWidth: 550,
    maxWidth: '90%'
  }
}

const innerStyle = {
  padding: 6
}

export const NewAppointmentModal = injectSheet(modalStyle)(({ open, onClose, calendar, assigneeId, time, classes }) => (
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
        time={time}
        onClose={onClose} />
    </div>
  </Modal>
))
