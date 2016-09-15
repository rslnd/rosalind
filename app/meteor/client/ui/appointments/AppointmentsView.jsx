import moment from 'moment'
import range from 'lodash/range'
import React from 'react'
import style from './style'

export class AppointmentsView extends React.Component {
  // row name    | column names
  // ---------------------------------------------------------------
  // [header]    | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // [time-800]  | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // [time-805]  | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // [time-810]  | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // ...         | ...
  // [time-2100] | [time] [assignee-1] [assignee-2] ... [assignee-n]
  grid () {
    const timeRange = range(700, 2200, 5)
    return {
      display: 'grid',
      gridTemplateColumns: `[time] 60px ${this.props.assignees.map((assignee) =>
        `[assignee-${assignee.assigneeId}] auto`).join(' ')}`,
      gridTemplateRows: `[header] 40px [subheader] 40px ${timeRange.map((time) => `[time-${time}] 18px`).join(' ')}`
    }
  }

  render () {
    return (
      <div style={this.grid()}>
        {this.props.assignees.map((assignee) => (
          <div key={assignee.assigneeId} className={style.headerCell} style={{
            gridRow: 'header',
            gridColumn: `assignee-${assignee.assigneeId}`
          }}>
            {assignee.fullNameWithTitle}
          </div>
        ))}
        {this.props.assignees.map((assignee) => (
          assignee.appointments.map((appointment) => (
            <div key={appointment._id} className={style.appointment} style={{
              gridRow: moment(appointment.start).format('[time-]Hmm'),
              gridColumn: `assignee-${assignee.assigneeId}`
            }}>
              {appointment.start.toString().substr(15, 9)}
            </div>
          ))
        ))}
      </div>
    )
  }
}
