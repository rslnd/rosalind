import React from 'react'
import moment from 'moment'
import { TAPi18n } from 'meteor/tap:i18n'
import { Users } from 'api/users'
import { TagsList } from 'client/ui/tags/TagsList'
import { PatientProfileContainer } from 'client/ui/patients/PatientProfileContainer'
import { PastAppointmentsContainer } from 'client/ui/patients/PastAppointmentsContainer'

export class AppointmentInfo extends React.Component {
  render () {
    const appointment = this.props.appointment
    const assignee = Users.findOne({ _id: appointment.assigneeId })

    return (
      <div className="row">
        <div className="col-md-6">
          <h4>
            {moment(appointment.start).format(TAPi18n.__('time.dateFormatWeekday'))} {TAPi18n.__('time.at')} <b>{moment(appointment.start).format(TAPi18n.__('time.timeFormat'))}</b>
          </h4>
          <h4 className="text-muted">
            {
              assignee
              ? <span>{TAPi18n.__('appointments.assignedTo')} <b>{assignee.fullNameWithTitle()}</b></span>
              : TAPi18n.__('appointments.unassigned')
            }
          </h4>
          <p><TagsList tags={appointment.tags} />&nbsp;</p>
          {
            appointment.notes &&
              <blockquote>{appointment.notes}</blockquote>
          }
        </div>

        {
          appointment.patientId &&
            <div className="col-md-6">
              <PatientProfileContainer patientId={appointment.patientId} />
              <PastAppointmentsContainer patientId={appointment.patientId} excludeAppointmentId={appointment._id} />
            </div>
        }
      </div>
    )
  }
}
