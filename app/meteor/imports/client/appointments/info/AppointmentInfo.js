import React from 'react'
import identity from 'lodash/identity'
import { touch, Field, FormSection } from 'redux-form'
import { AddressFields } from '../../patients/fields/AddressFields'
import { BirthdayFields } from '../../patients/fields/BirthdayFields'
import { Stamps } from '../../helpers/Stamps'
import { logFormat } from './logFormat'
import { Logs } from '../../helpers/Logs'
import { TagsField } from '../../tags/TagsField'
import { calculateRevenue } from '../new/RevenueField'
import { Day, Time, Assignee } from './BasicAppointmentFields'
import { AppointmentNote } from './AppointmentNote'
import { Contacts } from './Contacts'
import { Agreements } from '../../patientAppointments/Agreements'
import { PrivateRevenue, TotalRevenue } from './PrivateRevenue'
import { ListItem } from './ListItem'
import { Reminders } from './Reminders'
import { PatientName } from './PatientName'
import { PatientNotes } from './PatientNotes'
import { Consent } from './Consent'
import { ReferralsContainer } from '../../referrals/ReferralsContainer'

const autofillRevenue = change => (e, tags) => {
  if (tags && tags.length >= 1) {
    const revenue = calculateRevenue(tags)
    if (revenue === 0 || revenue > 0) {
      change('appointment.revenue', revenue)
    }
  }
}

const Tags = ({ appointment, allowedTags, maxDuration, assignee, calendar, constraint, change }) => (
  <ListItem hr>
    <Field
      name='tags'
      component={TagsField}
      allowedTags={allowedTags}
      maxDuration={maxDuration}
      time={appointment.start}
      calendarId={calendar._id}
      assigneeId={assignee && assignee._id}
      showDefaultRevenue={false}
      onChange={autofillRevenue(change)}
      constraint={constraint}
      fullWidth
    />
  </ListItem>
)

export class AppointmentInfo extends React.Component {
  constructor(props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentWillMount() {
    // TODO: This doensn't work.
    // TODO: How to show validation errors even on untouched fields?
    setTimeout(() => {
      touch('appointmentInfoForm', 'patient.contacts', 'patient.birthday', 'patient.insuranceId')
    }, 500)
  }

  // BUG: This seems to never get called. Why?
  handleSubmit(handler) {
    return (e) => {
      e && e.preventDefault && e.preventDefault()
      this.props.handleSubmit(handler)(e)
    }
  }

  render() {
    const {
      isLoading,
      handleSubmit,
      dirty,
      appointment,
      patient,
      assignee,
      calendar,
      totalPatientRevenue,
      allowedTags,
      maxDuration,
      change,
      canRefer,
      handleEditPatient,
      handleEditAppointment,
      handleToggleGender,
      handleSetMessagePreferences,
      constraint
    } = this.props

    return (
      <div>
        {
          patient &&
          <form onSubmit={this.handleSubmit(handleEditPatient)}>
            <div className='row'>
              <div className='col-md-12'>
                <FormSection name='patient'>
                  <PatientName
                    onChange={handleSubmit(handleEditPatient)}
                    patient={patient} />
                </FormSection>
                <hr />
              </div>
            </div>

            <input type='submit' style={{ display: 'none' }} />
          </form>
        }
        <div className='row'>
          {
            appointment &&
            <div className='col-md-6'>
              <form onMouseLeave={
                dirty
                  ? handleSubmit(handleEditAppointment)
                  : identity
              }
                onSubmit={this.handleSubmit(handleEditAppointment)}>
                <FormSection name='appointment'>
                  <Day appointment={appointment} />
                  <Time appointment={appointment} />
                  <Assignee assignee={assignee} />
                  <PrivateRevenue appointment={appointment} />
                  <Tags
                    appointment={appointment}
                    allowedTags={allowedTags}
                    maxDuration={maxDuration}
                    assignee={assignee}
                    calendar={calendar}
                    change={change}
                    constraint={constraint}
                  />
                </FormSection>
                <input type='submit' style={{ display: 'none' }} />
              </form>

              {
                canRefer &&
                <ListItem>
                  <ReferralsContainer appointment={appointment} />
                </ListItem>
              }

              <ListItem>
                <Logs format={logFormat} doc={appointment} />
                <Stamps
                  collectionName='appointments'
                  fields={['removed', 'created', 'admitted', 'canceled']}
                  doc={appointment} />
              </ListItem>
            </div>
          }

          {
            !patient && appointment &&
            <form
              className='col-md-6'
              onMouseLeave={
                dirty
                  ? handleSubmit(handleEditAppointment)
                  : identity
              }
              onSubmit={this.handleSubmit(handleEditAppointment)}>
              <FormSection name='appointment'>
                <AppointmentNote appointment={appointment} />
              </FormSection>
              <input type='submit' style={{ display: 'none' }} />
            </form>
          }

          {
            patient &&
            <form
              className='col-md-6'
              style={{ marginTop: -25 }}
              onMouseLeave={
                dirty
                  ? handleSubmit(handleEditPatient)
                  : identity
              }
              onSubmit={this.handleSubmit(handleEditPatient)}>
              <FormSection name='patient'>
                <PatientNotes patient={patient} />
                {/* Show first if not agreed yet */}
                {
                  appointment &&
                  <Consent
                    appointment={appointment}
                    calendar={calendar}
                    showOnly='pending' />
                }
                {
                  calendar &&
                  <Agreements
                    patient={patient}
                    calendarId={calendar._id}
                    showOnly='pending'
                  />
                }
                <Contacts patient={patient} />
                <BirthdayFields collectInsuranceId />
                <FormSection name='address'>
                  <AddressFields change={change} />
                </FormSection>
                <br />
                <Reminders />
                {
                  appointment &&
                  <Consent
                    appointment={appointment}
                    calendar={calendar}
                    showOnly='agreed'
                  />
                }
                {
                  calendar &&
                  <Agreements
                    patient={patient}
                    calendarId={calendar._id}
                    showOnly='agreed'
                  />
                }
                <TotalRevenue value={totalPatientRevenue} />
              </FormSection>
              <input type='submit' style={{ display: 'none' }} />
            </form>
          }
        </div>
      </div>
    )
  }
}
