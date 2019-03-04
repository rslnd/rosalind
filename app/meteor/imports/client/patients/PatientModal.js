import React from 'react'
import Modal from 'react-bootstrap/lib/Modal'
import Button from '@material-ui/core/Button'
import { PastAppointmentsContainer } from './PastAppointmentsContainer'
import { AppointmentInfoContainer } from '../appointments/info/AppointmentInfoContainer'

export const PatientModal = ({ show, onClose, patientId }) => (
  <Modal
    enforceFocus={false}
    show={show}
    onHide={onClose}
    bsSize='large'>
    <Modal.Body>
      <AppointmentInfoContainer patientId={patientId} />
      <PastAppointmentsContainer patientId={patientId} />
    </Modal.Body>
  </Modal>
)
