import React from 'react'
import { Appointment } from '../appointment/Appointment'

export const appointments = ({ assignees, onClick, move }) => {
  const { isMoving, moveToTime, moveToAssigneeId, moveAppointmentId, appointment, patient } = move

  let appointmentsList = assignees.map((assignee) => (
    assignee.appointments.map((appointment) => {
      if (isMoving && moveAppointmentId === appointment._id) {
        // The appointment that is being moved is rendered separately below
        return null
      } else {
        return (
          <Appointment
            key={appointment._id}
            appointment={appointment}
            onClick={onClick}
          />
        )
      }
    })
  ))

  if (isMoving) {
    appointmentsList.push(
      <Appointment
        key='move'
        appointment={move.appointment}
        patient={move.patient}
        isMoving
        moveToAssigneeId={moveToAssigneeId}
        moveToTime={moveToTime}
        onClick={onClick}
      />
    )
  }

  return appointmentsList
}
