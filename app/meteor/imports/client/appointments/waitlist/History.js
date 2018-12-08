import React from 'react'
import { AppointmentInfoContainer } from '../info/AppointmentInfoContainer'
import { PastAppointmentsContainer } from '../../patients/PastAppointmentsContainer'

export const History = ({ appointment, patient }) =>
  <div>
    <AppointmentInfoContainer
      minimal
      appointmentId={appointment._id}
    />

    <PastAppointmentsContainer
      patientId={patient._id}
      currentAppointmentId={appointment._id}
    />
  </div>
