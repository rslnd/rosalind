import React from 'react'
import { Appointment } from '../appointment/Appointment'
import { formatter } from './timeSlots'

export const appointments = ({ calendar, slotSize, scheduleOffset, atMinutes, appointments, onClick, move, canSeeBookables, canEditBookables }) => {
  const format = formatter(slotSize, scheduleOffset, atMinutes)

  return appointments.map((appointment) => {
    if (move.isMoving && move.moveAppointmentId === appointment._id) {
      return <Appointment
        key={appointment._id}
        isMoving
        calendar={calendar}
        appointment={move.appointment}
        moveToStart={move.moveToStart}
        moveToEnd={move.moveToEnd}
        moveToAssigneeId={move.moveToAssigneeId}
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
          canSeeBookables={canSeeBookables}
          canEditBookables={canEditBookables}
        />
      )
    }
  })
}
