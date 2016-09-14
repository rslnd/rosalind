import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { weekOfYear } from 'util/time/format'
import { DateNavigation } from 'client/ui/components/DateNavigation'

export class AppointmentsScreen extends React.Component {
  render () {
    return (
      <div>
        <div className="content-header">
          <h1>
            {TAPi18n.__('appointments.this')} {this.props.date.format(TAPi18n.__('time.dateFormatWeekday'))}&nbsp;
            <small>{weekOfYear(this.props.date)}</small>
          </h1>
          <DateNavigation date={this.props.date} basePath="appointments" pullRight />
        </div>
        <div className="content">
          Count: {this.props.appointments.length}
          <ul>
            {this.props.appointments.map((appointment) => (
              <li key={appointment._id}>
                Start: {appointment.start.toString()}
                Assignee: {appointment.assigneeId}
                Patient: {appointment.patientId}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}
