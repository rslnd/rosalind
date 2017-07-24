import React from 'react'
import moment from 'moment-timezone'
import { TAPi18n } from 'meteor/tap:i18n'
import { Users } from '../../api/users'
import { getColor } from '../tags/getColor'
import { Indicator } from '../appointments/appointment/Indicator'

const Appointment = ({ appointment }) => {
  const assignee = Users.findOne({ _id: appointment.assigneeId })
  const color = getColor(appointment.tags)
  return (
    <li
      style={{
        borderLeft: `4px solid ${color}`,
        paddingLeft: 10,
        listStyleType: 'none',
        textDecoration: appointment.canceled && 'line-through',
        color: appointment.canceled && '#ccc'
      }}>
      {moment(appointment.start).format(TAPi18n.__('time.dateFormatShort'))} {moment(appointment.start).format(TAPi18n.__('time.timeFormat'))}&emsp;
      {assignee && assignee.fullNameWithTitle()}
      <Indicator appointment={appointment} />
    </li>
  )
}

export const PastAppointments = ({ pastAppointments, futureAppointments }) => {
  const sections = [
    { title: TAPi18n.__('appointments.thisFuture'), appointments: futureAppointments },
    { title: TAPi18n.__('appointments.thisPast'), appointments: pastAppointments }
  ]

  return (
    <div>
      {
        sections.map((section) => (
          section.appointments.length > 0 &&
            <div key={section.title}>
              <h6>{section.title}</h6>
              <ul style={{ paddingLeft: 10 }}>
                {section.appointments.map((appointment) => (
                  <Appointment
                    key={appointment._id}
                    appointment={appointment} />
                ))}
              </ul>
            </div>
        ))
      }
    </div>
  )
}
