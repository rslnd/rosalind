import React from 'react'
import moment from 'moment'
import { TAPi18n } from 'meteor/tap:i18n'
import { Users } from 'api/users'
import { TagsList } from 'client/ui/tags/TagsList'

export class AppointmentInfo extends React.Component {
  render () {
    const appointment = this.props.appointment
    const assignee = Users.findOne({ _id: appointment.assigneeId })

    return (
      <div>
        <h4>{moment(appointment.start).format(TAPi18n.__('time.dateFormatWeekday'))}</h4>
        <h4>{TAPi18n.__('time.at')} <b>{moment(appointment.start).format(TAPi18n.__('time.timeFormat'))}</b></h4>
        <h4>
          <TagsList tags={appointment.tags} />&nbsp;
          {
            assignee
            ? <span>{TAPi18n.__('appointments.assignedTo')} <b>{assignee.fullNameWithTitle()}</b></span>
            : <span className="text-muted">{TAPi18n.__('unassigned')}</span>
          }
        </h4>
        {
          appointment.notes &&
            <blockquote>{appointment.notes}</blockquote>
        }
      </div>
    )
  }
}
