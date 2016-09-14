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
          Assignees: {this.props.assignees.length}<br />
          Assignees: {this.props.assignees.length}<br />
          <ul>
            {this.props.assignees.map((assignee) => (
              <li key={assignee.assigneeId}>
                Assignee: {assignee.name}
                # Appointments: {assignee.appointments.length}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}
