import moment from 'moment'
import { TAPi18n } from 'meteor/tap:i18n'
import { Users } from 'api/users'

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
              <ul>
                {section.appointments.map((appointment) => {
                  const assignee = Users.findOne({ _id: appointment.assigneeId })
                  return (
                    <li key={appointment._id}>
                      {moment(appointment.start).format(TAPi18n.__('time.dateFormatShort'))} {moment(appointment.start).format(TAPi18n.__('time.timeFormat'))}&emsp;
                      {assignee && assignee.fullNameWithTitle()}
                    </li>
                  )
                })}
              </ul>
            </div>
        ))
      }
    </div>
  )
}
