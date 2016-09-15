import moment from 'moment'
import 'moment-range'
import React from 'react'
import style from './style'

export class AppointmentsView extends React.Component {
  // row name    | column names
  // ---------------------------------------------------------------
  // [header]    | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // [time-0800] | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // [time-0805] | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // [time-0810] | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // ...         | ...
  // [time-2100] | [time] [assignee-1] [assignee-2] ... [assignee-n]
  grid () {
    const options = {
      start: moment().hour(7).startOf('hour'),
      end: moment().hour(22).endOf('hour')
    }

    const timeRange = moment.range(options.start, options.end).toArray('minutes')

    return {
      display: 'grid',
      gridTemplateColumns: `[time] 60px ${this.props.assignees.map((assignee) =>
        `[assignee-${assignee.assigneeId}] auto`).join(' ')}`,
      gridTemplateRows: `[header] 40px [subheader] 40px ${timeRange.map((time) => `[time-${moment(time).format('HHmm')}] 4px`).join(' ')}`
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
              gridRowStart: moment(appointment.start).format('[time-]HHmm'),
              gridRowEnd: moment(appointment.end).format('[time-]HHmm'),
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
