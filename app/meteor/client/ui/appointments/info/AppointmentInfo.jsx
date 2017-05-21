import React from 'react'
import moment from 'moment-timezone'
import uniqBy from 'lodash/uniqBy'
import { Toggle, Choice } from 'belle'
import { TAPi18n } from 'meteor/tap:i18n'
import { zerofix } from 'util/zerofix'
import { Icon } from 'client/ui/components/Icon'
import { TagsList } from 'client/ui/tags/TagsList'
import { InlineEdit } from 'client/ui/components/form/InlineEdit'
import { Birthday as BirthdayWithAge } from 'client/ui/patients/Birthday'
import { Stamps } from 'client/ui/helpers/Stamps'
import { PastAppointmentsContainer } from 'client/ui/patients/PastAppointmentsContainer'
import { EnlargeText } from 'client/ui/components/EnlargeText'

const ListItem = ({ icon, children, last = false, style }) => (
  <div style={style}>
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
    {!last && <hr />}
  </div>
)

const PatientName = ({ patient, onChange, onToggleGender }) => (
  patient && patient.profile && <div>
    <h4 className="enable-select" style={{ paddingLeft: 10 }}>
      <span
        className="text-muted"
        style={{ cursor: 'pointer' }}
        onClick={onToggleGender}
      >{
        patient.prefix()
      }&#8202; </span>
      <b>
        <InlineEdit
          onChange={(val) => onChange({ 'profile.lastName': val })}
          value={patient.profile.lastName}
          placeholder={<span className="text-muted">{TAPi18n.__('patients.lastName')}</span>}
          label={TAPi18n.__('patients.lastName')}
          submitOnBlur
        />
      </b>
       &thinsp;
      <InlineEdit
        onChange={(val) => onChange({ 'profile.firstName': val })}
        value={patient.profile.firstName}
        placeholder={<span className="text-muted">{TAPi18n.__('patients.firstName')}</span>}
        label={TAPi18n.__('patients.firstName')}
        submitOnBlur
      />
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

const Assignee = ({ assignee, appointment }) => (
  assignee && <ListItem icon="user-md">
    {assignee.fullNameWithTitle()}

    <div className="pull-right" style={{
      position: 'relative',
      top: -6
    }}>
      <Tags appointment={appointment} />
    </div>
  </ListItem> || null
)

const Contacts = ({ patient }) => (
  patient && patient.profile && patient.profile.contacts && <div>
    {uniqBy(patient.profile.contacts, 'value').map((contact) => (
      contact.channel === 'Phone'
      ? (
        <ListItem key={contact.value} icon="phone">
          <EnlargeText>{zerofix(contact.value)}</EnlargeText>
        </ListItem>
      ) : (
        <ListItem key={contact.value} icon="envelope-o">
          <a href={`mailto:${contact.value}`} title={TAPi18n.__('ui.composeEmail')}>{contact.value}</a>
        </ListItem>
      )
    ))}
  </div> || null
)

const Birthday = ({ patient }) => (
  patient && patient.profile && patient.profile.birthday && <ListItem icon="birthday-cake">
    <BirthdayWithAge day={patient.profile.birthday} />
  </ListItem> || null
)

const Tags = ({ appointment }) => (
  appointment.tags && <div>
    <TagsList tags={appointment.tags} last style={{
      marginRight: 10
    }} />
  </div> || null
)

const Reminders = ({ patient, onChange }) => (
  patient && patient.profile && patient.profile.contacts && <ListItem icon="paper-plane">
    {TAPi18n.__('appointments.appointmentReminderSMS')}
    <div className="pull-right" style={{
      position: 'absolute',
      right: 5,
      top: -5
    }}>

      <Toggle
        style={{transform: 'scale(0.6)'}}
        firstChoiceStyle={{backgroundColor: '#8fc6ae'}}
        secondChoiceStyle={{backgroundColor: '#e37067'}}
        value={!patient.profile.noSMS}
        onUpdate={onChange}>
        <Choice value><Icon name="check" /></Choice>
        <Choice value={false}><Icon name="times" /></Choice>
      </Toggle>
    </div>
  </ListItem> || null
)

const AppointmentNotes = ({ appointment, onChange }) => (
  <ListItem icon="info-circle" last style={{ marginBottom: 30 }}>
    <InlineEdit
      onChange={onChange}
      value={appointment.notes()}
      placeholder={<span className="text-muted">{TAPi18n.__('appointments.form.note.placeholder')}</span>}
      rows={3}
      label={TAPi18n.__('appointments.form.note.label')}
      />
  </ListItem>
)

export class AppointmentInfo extends React.Component {
  render () {
    const {
      appointment,
      patient,
      assignee,
      handleEditNote,
      handleEditPatient,
      handleToggleGender,
      handleSetMessagePreferences } = this.props

    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <PatientName patient={patient} onChange={handleEditPatient} onToggleGender={handleToggleGender} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <Day appointment={appointment} />
            <Time appointment={appointment} />
            <Assignee assignee={assignee} appointment={appointment} />
            <AppointmentNotes appointment={appointment} onChange={handleEditNote} />
            <ListItem last>
              <Stamps
                fields={['removed', 'created', 'admitted', 'canceled']}
                doc={appointment} />
            </ListItem>
          </div>

          <div className="col-md-6">
            <Contacts patient={patient} />
            <Birthday patient={patient} />
            <Reminders patient={patient} onChange={handleSetMessagePreferences} />

            {patient && <PastAppointmentsContainer patientId={appointment.patientId} excludeAppointmentId={appointment._id} />}
          </div>
        </div>
      </div>
    )
  }
}
