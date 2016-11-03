import React from 'react'
import moment from 'moment'
import { TAPi18n } from 'meteor/tap:i18n'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import { TagsList } from 'client/ui/tags/TagsList'
import { Icon } from 'client/ui/components/Icon'
import { PatientProfileContainer } from 'client/ui/patients/PatientProfileContainer'
import { PastAppointmentsContainer } from 'client/ui/patients/PastAppointmentsContainer'

export class AppointmentInfo extends React.Component {
  render () {
    const appointment = this.props.appointment

    return (
      <div className="row">
        <div className="col-md-6">
          <h4>
            {moment(appointment.start).format(TAPi18n.__('time.dateFormatWeekday'))} {TAPi18n.__('time.at')} <b>{moment(appointment.start).format(TAPi18n.__('time.timeFormat'))}</b>
          </h4>
          <h4 className="text-muted">
            {
              this.props.assignee
              ? <span>{TAPi18n.__('appointments.assignedTo')} <b>{this.props.assignee.fullNameWithTitle()}</b></span>
              : TAPi18n.__('appointments.unassigned')
            }
          </h4>
          <p><TagsList tags={appointment.tags} />&nbsp;</p>
          {
            appointment.notes() && appointment.notes().length > 1 &&
              <blockquote>{appointment.notes()}</blockquote>
          }

          <br />

          {
            appointment.admitted
            ? <RaisedButton
              label={<span><Icon name="check" />&emsp;{TAPi18n.__('appointments.admit')}</span>}
              backgroundColor={'#C5E1A5'}
              onClick={this.props.unsetAdmitted} />
            : <RaisedButton
              label={<span><Icon name="check" />&emsp;{TAPi18n.__('appointments.admit')}</span>}
              onClick={this.props.setAdmitted} />
          }
          {
            appointment.canceled
            ? <RaisedButton
              label={<span>{TAPi18n.__('appointments.cancel')}&emsp;<Icon name="times" /></span>}
              backgroundColor={'#e4e3e3'}
              onClick={this.props.unsetCanceled} />
            : <RaisedButton
              label={<span>{TAPi18n.__('appointments.cancel')}&emsp;<Icon name="times" /></span>}
              onClick={this.props.setCanceled} />
          }

          <br /><br />
          <FlatButton
            label={<span><Icon name="trash-o" />&emsp;{TAPi18n.__('appointments.softRemove')}</span>}
            onClick={this.props.softRemove} />

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
