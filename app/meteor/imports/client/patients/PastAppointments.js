import React from 'react'
import moment from 'moment-timezone'
import { TAPi18n } from 'meteor/tap:i18n'
import { Users } from '../../api/users'
import { getColor } from '../tags/getColor'
import { Indicator } from '../appointments/appointment/Indicator'
import { TagsList } from '../tags/TagsList';

const Appointment = ({ appointment }) => {
  const assignee = Users.findOne({ _id: appointment.assigneeId })
  const canceled = appointment.canceled || appointment.removed
  return (
    <li
      style={{
        listStyleType: 'none'
      }}>
      <TagsList tiny tags={appointment.tags} />
      &ensp;
      <span style={{
        display: 'inline-block',
        textDecoration: canceled && 'line-through',
        color: canceled && '#ccc',
        paddingTop: 4,
        verticalAlign: -2 }}>
        {moment(appointment.start).format(TAPi18n.__('time.dateFormatShort'))} {moment(appointment.start).format(TAPi18n.__('time.timeFormat'))}&emsp;
        {assignee && assignee.lastNameWithTitle()}
      </span>
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
