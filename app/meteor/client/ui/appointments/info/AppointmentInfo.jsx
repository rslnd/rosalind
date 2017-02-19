import React from 'react'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import { Toggle } from 'belle'
import { TAPi18n } from 'meteor/tap:i18n'
import { zerofix } from 'util/zerofix'
import { Icon } from 'client/ui/components/Icon'
import { TagsListText } from 'client/ui/tags/TagsListText'
import { Birthday as BirthdayWithAge } from 'client/ui/patients/Birthday'
import { Stamps } from 'client/ui/helpers/Stamps'
import { PastAppointmentsContainer } from 'client/ui/patients/PastAppointmentsContainer'

const ListItem = ({ icon, children }) => (
  <div>
    <div className="row">
      <div className="col-md-1">
        {icon && <Icon name={icon} style={{
          position: 'absolute',
          left: 27,
          top: 3
        }} />}
      </div>
      <div className="col-md-11 enable-select">{children}</div>
    </div>
    <hr />
  </div>
)

const PatientName = ({ patient }) => (
  patient && patient.profile && <div>
    <h4 className="enable-select">
      <span className="text-muted">{patient.prefix()}&#8202; </span>
      <b>{patient.profile.lastName}</b> &thinsp;{patient.profile.firstName}
    </h4>
    <hr />
  </div> || null
)

const Day = ({ appointment }) => (
  <ListItem icon="calendar">
    {moment(appointment.start).format(TAPi18n.__('time.dateFormatWeekday'))}
  </ListItem>
)

const Time = ({ appointment }) => (
  <ListItem icon="clock-o">
    {moment(appointment.start).format(TAPi18n.__('time.timeFormatShort'))}
    &nbsp;-&nbsp;
    {moment(appointment.end).format(TAPi18n.__('time.timeFormat'))}
  </ListItem>
)

const Assignee = ({ assignee }) => (
  assignee && <ListItem icon="user-md">
    {assignee.fullNameWithTitle()}
  </ListItem> || null
)

const Contacts = ({ patient }) => (
  patient && patient.profile && patient.profile.contacts && <div>
    {uniqBy(patient.profile.contacts, 'value').map((contact) => (
      contact.channel === 'Phone'
      ? <ListItem key={contact.value} icon="phone">{zerofix(contact.value)}</ListItem>
      : <ListItem key={contact.value} icon="envelope-o">{contact.value}</ListItem>
    ))}
  </div> || null
)

const Birthday = ({ patient }) => (
  patient && patient.profile && patient.profile.birthday && <ListItem icon="birthday-cake">
    <BirthdayWithAge day={patient.profile.birthday} />
  </ListItem> || null
)

const Tags = ({ appointment }) => (
  appointment.tags && <ListItem icon="info-circle">
    <TagsListText tags={appointment.tags} />
  </ListItem> || null
)

const Reminders = ({ patient }) => (
  patient && patient.profile && patient.profile.contacts && <ListItem icon="paper-plane">
    SMS-Terminerinnerung
    <div className="pull-right" style={{
      position: 'absolute',
      right: 5,
      top: -5
    }}>
      <Toggle style={{ transform: 'scale(0.6)' }} />
    </div>
  </ListItem> || null
)

export class AppointmentInfo extends React.Component {
  render () {
    const { appointment, patient, assignee } = this.props

    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <PatientName patient={patient} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <Day appointment={appointment} />
            <Time appointment={appointment} />
            <Assignee assignee={assignee} />
            <Tags appointment={appointment} />
            <ListItem>
              <Stamps
                fields={['removed', 'created', 'admitted', 'canceled']}
                doc={appointment}
                style={{ fontSize: '90%' }} />
            </ListItem>
          </div>

          <div className="col-md-6">
            <Contacts patient={patient} />
            <Birthday patient={patient} />
            <Reminders patient={patient} />

            {patient && <PastAppointmentsContainer patientId={appointment.patientId} excludeAppointmentId={appointment._id} />}
          </div>
        </div>
      </div>
    )
  }
}
