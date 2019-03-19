import React from 'react'
import { Appointment } from '../appointment/Appointment'
import { formatter } from './timeSlots'

export const appointments = ({ calendar, slotSize, appointments, onClick, move }) => {
  const format = formatter(slotSize)

  return appointments.map((appointment) => {
    if (move.isMoving && move.moveAppointmentId === appointment._id) {
      return <Appointment
        key={appointment._id}
        isMoving
        appointment={move.appointment}
        moveToTime={move.moveToTime}
        moveToAssigneeId={move.moveToAssigneeId}
        patient={move.patient}
        onClick={onClick}
        format={format}
      />
    } else {
      return (
        <Appointment
          key={appointment._id}
          appointment={appointment}
          calendar={calendar}
          onClick={onClick}
          format={format}
        />
      )
    }
  })
}
