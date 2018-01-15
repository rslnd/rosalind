import React from 'react'
import moment from 'moment-timezone'
import { TAPi18n } from 'meteor/tap:i18n'
import { Users } from '../../api/users'
import { getColor } from '../tags/getColor'
import { Indicator, Revenue } from '../appointments/appointment/Indicator'
import { TagsList } from '../tags/TagsList';

{/* <span style={{
  display: 'inline-block',
  textDecoration: canceled && 'line-through',
  color: canceled && '#ccc',
  paddingTop: 4,
  verticalAlign: -2 }}> */}

const tableStyle = {
  paddingLeft: 10,
  width: '100%'
}

const tdStyle = {
  whiteSpace: 'nowrap',
  padding: 4
}

const dateStyle = {
  ...tdStyle,
  width: 200
}

const timeStyle = {
  ...tdStyle,
  width: 95
}

const dateFormat = m =>
  m.year() === moment().year()
  ? m.format(TAPi18n.__('time.dateFormatWeekdayShortNoYear'))
  : m.format(TAPi18n.__('time.dateFormatWeekdayShort'))

const AppointmentRow = ({ appointment }) => {
  const assignee = Users.findOne({ _id: appointment.assigneeId })
  const canceled = appointment.canceled || appointment.removed
  const date = moment(appointment.start)

  return (
    <div className='row'>
      <div className='col-md-3'>
        {dateFormat(date)}

        <span className='pull-right'>
          {date.format(TAPi18n.__('time.timeFormat'))}
        </span>
      </div>

      <div className='col-md-4'>
        <TagsList tiny tags={appointment.tags} />
      </div>

      <div className='col-md-3 text-right'>
        {assignee && assignee.lastNameWithTitle()}
      </div>

      <div className='col-md-2 text-right'>
        <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
          <Revenue appointment={appointment} />
        </div>
        <div style={{ display: 'inline-block', minWidth: 25 }}>
          <Indicator appointment={appointment} />
        </div>
      </div>
    </div>
  )
}

export const PastAppointments = ({ currentAppointment, pastAppointments, futureAppointments }) => {
  const appointmentsWithSeparators = [
    { separator: TAPi18n.__('appointments.thisFuture'), count: futureAppointments.length },
    ...futureAppointments,

    { separator: TAPi18n.__('appointments.thisCurrent'), count: 1 },
    currentAppointment,

    { separator: TAPi18n.__('appointments.thisPast'), count: pastAppointments.length },
    ...pastAppointments
  ]

  return (
    <div>
      {
        appointmentsWithSeparators.map((item, i) =>
          item.separator
          ? (
            item.count > 0 &&
              <div className='row' key={i}>
                <div className='col-md-12'>
                  <h6>{item.separator}</h6>
                </div>
              </div>
            )
          : <AppointmentRow
            key={item._id}
            appointment={item} />
        )
      }
    </div>
  )
}
