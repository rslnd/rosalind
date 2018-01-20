import React from 'react'
import { touch, Field, FieldArray, FormSection } from 'redux-form'
import moment from 'moment-timezone'
import { Toggle, Choice } from 'belle'
import { TAPi18n } from 'meteor/tap:i18n'
import { zerofix } from '../../../util/zerofix'
import { Icon } from '../../components/Icon'
import { TagsList } from '../../tags/TagsList'
import { InlineEdit } from '../../components/form/InlineEdit'
import { Dot } from '../../patients/Dot'
import { ContactFields } from '../../patients/fields/ContactFields'
import { AddressFields } from '../../patients/fields/AddressFields'
import { BirthdayFields } from '../../patients/fields/BirthdayFields'
import { Stamps } from '../../helpers/Stamps'
import { EnlargeText } from '../../components/EnlargeText'
import { Currency } from '../../components/Currency'
import { TagsField } from '../../tags/TagsField'

const ListItem = ({ icon, children, last, style, highlight }) => {
  const containerStyle = {
    ...style,
    fontWeight: highlight && '700'
  }

  return <div style={containerStyle}>
    <div className='row'>
      <div className='col-md-1'>
        {icon && <Icon name={icon} style={{
          position: 'absolute',
          left: 27,
          top: 3
        }} />}
      </div>
      <div className='col-md-11 enable-select'>{children}</div>
    </div>
    {!last && <hr />}
  </div>
}

const PatientName = ({ patient, onChange, onToggleGender }) => (
  patient && patient.profile && <div>
    <h4 className='enable-select' style={{ paddingLeft: 10 }}>
      <span
        className='text-muted'
        style={{ cursor: 'pointer' }}
        onClick={onToggleGender}
      >{
        patient.prefix()
      }&#8202; </span>
      <b>
        <InlineEdit
          onChange={(val) => onChange({ 'profile.lastName': val })}
          value={patient.profile.lastName}
          placeholder={<span className='text-muted'>{TAPi18n.__('patients.lastName')}</span>}
          label={TAPi18n.__('patients.lastName')}
          submitOnBlur
        />
      </b>
       &thinsp;
      <InlineEdit
        onChange={(val) => onChange({ 'profile.firstName': val })}
        value={patient.profile.firstName}
        placeholder={<span className='text-muted'>{TAPi18n.__('patients.firstName')}</span>}
        label={TAPi18n.__('patients.firstName')}
        submitOnBlur
      />
    </h4>
  </div> || null
)

const Day = ({ appointment }) => (
  <ListItem icon='calendar'>
    {moment(appointment.start).format(TAPi18n.__('time.dateFormatWeekday'))}
  </ListItem>
)

const Time = ({ appointment }) => (
  <ListItem icon='clock-o'>
    {moment(appointment.start).format(TAPi18n.__('time.timeFormatShort'))}
    &nbsp;-&nbsp;
    {moment(appointment.end).format(TAPi18n.__('time.timeFormat'))}
  </ListItem>
)

const Private = ({ appointment, onChange }) => {
  if (appointment.revenue >= 0) {
    return <ListItem icon='plus-circle'>
      Privattermin&ensp;
      <Currency value={appointment.revenue} />
    </ListItem>
  }

  if (appointment.privateAppointment) {
    return <ListItem icon='eur'>
      {TAPi18n.__('appointments.private')}
    </ListItem>
  }

  return null
}

const Assignee = ({ assignee }) => (
  assignee && <ListItem icon='user-md'>
    {assignee.fullNameWithTitle()}
  </ListItem> || null
)

const Contacts = ({ patient, onChange }) => (
  patient &&
    <div>
      <FieldArray
        name='contacts'
        channel='Phone'
        icon='phone'
        component={ContactFields} />

      <FieldArray
        name='contacts'
        channel='Email'
        icon='envelope-open-o'
        component={ContactFields} />
      <br />
    </div> || null
)

const Tags = ({ appointment, assignee, calendar, onChange }) => (
  <ListItem>
    <Field
      name='tags'
      component={TagsField}
      // allowedTags={allowedTags}
      calendarId={calendar._id}
      assigneeId={assignee && assignee._id}
      showDefaultRevenue={false}
      fullWidth
    />
  </ListItem>
)

const Reminders = ({ patient, onChange }) => (
  patient && patient.profile && patient.profile.contacts && <ListItem icon='paper-plane' last>
    {TAPi18n.__('appointments.appointmentReminderSMS')}
    <div className='pull-right' style={{
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
        <Choice value><Icon name='check' /></Choice>
        <Choice value={false}><Icon name='times' /></Choice>
      </Toggle>
    </div>
    <br /><br />
  </ListItem> || null
)

const TotalRevenue = ({ value }) => (
  value && value > 0 && <ListItem icon='pie-chart'>
    Gesamtumsatz&ensp;
    <Currency value={value} />
  </ListItem> || null
)

const PatientNotes = ({ patient, onChange }) => (
  patient && <ListItem
    icon='user-plus'
    style={{ marginBottom: 30 }}
    highlight={patient.notes()}
    last>
    <InlineEdit
      onChange={onChange}
      value={patient.notes()}
      placeholder={<span className='text-muted'>{TAPi18n.__('patients.notePlaceholder')}</span>}
      rows={3}
      label={TAPi18n.__('patients.note')}
      submitOnBlur
      />
  </ListItem> || null
)

export class AppointmentInfo extends React.Component {
  componentWillMount () {
    // TODO: This doensn't work.
    // TODO: How to show validation errors even on untouched fields?
    touch('appointmentInfoForm', 'contacts', 'birthday', 'insuranceId')
  }

  render () {
    const {
      appointment,
      patient,
      assignee,
      calendar,
      totalPatientRevenue,
      change,
      handleEditPatientNote,
      handleEditPatient,
      handleToggleGender,
      handleTagChange,
      handleSetBirthday,
      handleSetMessagePreferences } = this.props

    return (
      <div>
        {
          patient &&
            <div className='row'>
              <div className='col-md-12'>
                <div className='pull-right'>
                  <Dot
                    banned={patient.profile && patient.profile.banned}
                    onClick={() => handleEditPatient({
                      'profile.banned': !patient.profile.banned
                    })} />
                </div>

                <PatientName patient={patient} onChange={handleEditPatient} onToggleGender={handleToggleGender} />

                <hr />
              </div>
            </div>
        }
        <div className='row'>
          <div className='col-md-6'>
            <Day appointment={appointment} />
            <Time appointment={appointment} />
            <Assignee assignee={assignee} />
            <Private appointment={appointment} />
            <Tags appointment={appointment} assignee={assignee} calendar={calendar} />
            <ListItem last>
              <Stamps
                fields={['removed', 'created', 'admitted', 'canceled']}
                doc={appointment} />
            </ListItem>
          </div>

          {
            patient &&
              <div className='col-md-6'>
                <PatientNotes patient={patient} onChange={handleEditPatientNote} />
                <Contacts patient={patient} onChange={handleEditPatient} />
                <BirthdayFields collectInsuranceId />
                <FormSection name='address'>
                  <AddressFields change={change} />
                </FormSection>
                <br />
                <Reminders patient={patient} onChange={handleSetMessagePreferences} />
                <TotalRevenue value={totalPatientRevenue} />
              </div>
          }
        </div>
      </div>
    )
  }
}
