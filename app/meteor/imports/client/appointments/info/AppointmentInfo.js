import React from 'react'
import identity from 'lodash/identity'
import { touch, Field, FieldArray, FormSection } from 'redux-form'
import moment from 'moment-timezone'
import { Toggle, Choice } from 'belle'
import ClickAwayListener from 'material-ui/utils/ClickAwayListener'

import { TAPi18n } from 'meteor/tap:i18n'
import { zerofix } from '../../../util/zerofix'
import { Icon } from '../../components/Icon'
import { TagsList } from '../../tags/TagsList'
import { grow, rowStyle, flex, shrink, InlineEdit, TextField, ToggleField, iconStyle } from '../../components/form'
import { Dot } from '../../patients/Dot'
import { ContactFields } from '../../patients/fields/ContactFields'
import { AddressFields } from '../../patients/fields/AddressFields'
import { BirthdayFields } from '../../patients/fields/BirthdayFields'
import { Stamps } from '../../helpers/Stamps'
import { EnlargeText } from '../../components/EnlargeText'
import { Currency } from '../../components/Currency'
import { TagsField } from '../../tags/TagsField'

const iconDefaultStyle = {
  textAlign: 'center',
  paddingLeft: 6,
  paddingRight: 6,
  minWidth: 50,
}

const ListItem = ({ icon, children, hr, style, iconStyle, highlight }) => {
  const containerStyle = {
    ...style,
    fontWeight: highlight && '700'
  }

  return <div style={containerStyle}>
    <div style={flex}>
      <div style={{ ...iconDefaultStyle, ...iconStyle }}>
        {icon && <Icon name={icon} />}
      </div>
      <div style={grow} className='enable-select'>
        {children}
      </div>
    </div>
    {hr && <hr />}
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
  <ListItem icon='calendar' hr>
    {moment(appointment.start).format(TAPi18n.__('time.dateFormatWeekday'))}
  </ListItem>
)

const Time = ({ appointment }) => (
  <ListItem icon='clock-o' hr>
    {moment(appointment.start).format(TAPi18n.__('time.timeFormatShort'))}
    &nbsp;-&nbsp;
    {moment(appointment.end).format(TAPi18n.__('time.timeFormat'))}
  </ListItem>
)

const Private = ({ appointment }) => {
  if (appointment.revenue >= 0) {
    return <ListItem icon='plus-circle' hr>
      Privattermin&ensp;
      <Currency value={appointment.revenue} />
    </ListItem>
  }

  if (appointment.privateAppointment) {
    return <ListItem icon='eur' hr>
      {TAPi18n.__('appointments.private')}
    </ListItem>
  }

  return null
}

const Assignee = ({ assignee }) => (
  assignee && <ListItem icon='user-md' hr>
    {assignee.fullNameWithTitle()}
  </ListItem> || null
)

const Contacts = ({ patient }) => (
  patient &&
    <div>
      <FieldArray
        name='contacts'
        channel='Phone'
        icon='phone'
        zoomable
        component={ContactFields} />

      <FieldArray
        name='contacts'
        channel='Email'
        icon='envelope-open-o'
        component={ContactFields} />
    </div> || null
)

const Tags = ({ appointment, assignee, calendar }) => (
  <ListItem hr>
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
  patient && patient.profile && patient.profile.contacts && <ListItem icon='paper-plane'>
    {TAPi18n.__('appointments.appointmentReminderSMS')}
    <div className='pull-right' style={{
      position: 'relative',
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

const PatientNotes = ({ patient }) => (
  patient &&
    <div style={rowStyle}>
      <div style={iconStyle}>
        <Icon name='user-plus' />
      </div>
      <div style={grow}>
        <Field
          name='note'
          component={TextField}
          label={TAPi18n.__('patients.note')}
        />
      </div>

      <div style={shrink}>
        <Field
          name='banned'
          component={ToggleField}
          button={false}
          style={{ marginTop: 15, marginLeft: 20 }}
          values={[
            { value: false, label: <Dot /> },
            { value: true, label: <Dot banned /> }
          ]} />
      </div>
    </div> || null
)

export class AppointmentInfo extends React.Component {
  constructor (props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  componentWillMount () {
    // TODO: This doensn't work.
    // TODO: How to show validation errors even on untouched fields?
    touch('appointmentInfoForm', 'contacts', 'birthday', 'insuranceId')
  }

  // BUG: This seems to never get called. Why?
  handleSubmit (e) {
    e && e.preventDefault()
    if (this.props.dirty) {
      return Promise.all([
        this.props.handleSubmit(this.props.handleEditPatient),
        this.props.handleSubmit(this.props.handleEditAppointment)
      ])
    }
  }

  handleKeyDown (e) {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault()
      return this.handleSubmit()
    }
  }

  render () {
    const {
      handleSubmit,
      dirty,
      appointment,
      patient,
      assignee,
      calendar,
      totalPatientRevenue,
      change,
      handleEditPatient,
      handleEditAppointment,
      handleToggleGender,
      handleSetMessagePreferences } = this.props

    return (
      <form onSubmit={this.handleSubmit} onKeyDown={this.handleKeyDown}>
        <div className='row'>
          <div className='col-md-6'>
            {
              patient &&
                <PatientName
                  patient={patient}
                  onChange={handleEditPatient}
                  onToggleGender={handleToggleGender} />
            }
            { patient && <hr /> }

            <div onMouseLeave={
              dirty
              ? handleSubmit(handleEditAppointment)
              : identity
            }>
              <FormSection name='appointment'>
                <Day appointment={appointment} />
                <Time appointment={appointment} />
                <Assignee assignee={assignee} />
                <Private appointment={appointment} />
                <Tags appointment={appointment} assignee={assignee} calendar={calendar} />
              </FormSection>
            </div>
            <ListItem>
              <Stamps
                fields={['removed', 'created', 'admitted', 'canceled']}
                doc={appointment} />
            </ListItem>
          </div>

          {
            patient &&
              <div className='col-md-6' onMouseLeave={
                dirty
                ? handleSubmit(handleEditPatient)
                : identity
              }>
                <FormSection name='patient'>
                  <PatientNotes patient={patient} />
                  <Contacts patient={patient} />
                  <BirthdayFields collectInsuranceId />
                  <FormSection name='address'>
                    <AddressFields change={change} />
                  </FormSection>
                  <br />
                  <Reminders patient={patient} onChange={handleSetMessagePreferences} />
                  <TotalRevenue value={totalPatientRevenue} />
                </FormSection>
              </div>
          }
        </div>
      </form>
    )
  }
}
