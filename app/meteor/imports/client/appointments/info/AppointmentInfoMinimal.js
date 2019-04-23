import React from 'react'
import identity from 'lodash/identity'
import { touch, Field, FormSection } from 'redux-form'
import { Stamps } from '../../helpers/Stamps'
import { logFormat } from './logFormat'
import { Logs } from '../../helpers/Logs'
import { TagsField } from '../../tags/TagsField'
import { calculateRevenue } from '../new/RevenueField'
import { Agreements } from '../../patientAppointments/Agreements'
import { PrivateRevenue, TotalRevenue } from './PrivateRevenue'
import { ListItem } from './ListItem'
import { PatientNotes } from './PatientNotes'
import { Consent } from './Consent'

const autofillRevenue = change => (e, tags) => {
  if (tags && tags.length >= 1) {
    const revenue = calculateRevenue(tags)
    if (revenue === 0 || revenue > 0) {
      change('appointment.revenue', revenue)
    }
  }
}

const Tags = ({ appointment, allowedTags, maxDuration, assignee, calendar, change }) => (
  <ListItem>
    <Field
      name='tags'
      component={TagsField}
      allowedTags={allowedTags}
      maxDuration={maxDuration}
      calendarId={calendar._id}
      assigneeId={assignee && assignee._id}
      showDefaultRevenue={false}
      onChange={autofillRevenue(change)}
      fullWidth
    />
  </ListItem>
)

export class AppointmentInfoMinimal extends React.Component {
  constructor(props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentWillMount() {
    // TODO: This doensn't work.
    // TODO: How to show validation errors even on untouched fields?
    setTimeout(() =>
      touch('appointmentInfoForm', 'contacts', 'birthday', 'insuranceId'),
      500
    )
  }

  // BUG: This seems to never get called. Why?
  handleSubmit(e) {
    e && e.preventDefault && e.preventDefault()
    if (this.props.dirty) {
      return Promise.all([
        this.props.handleSubmit(this.props.handleEditPatient),
        this.props.handleSubmit(this.props.handleEditAppointment)
      ])
    }
  }

  render() {
    const {
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
      handleEditPatient,
      handleEditAppointment
    } = this.props

    return (
      <div>
        <div className='row'>
          <div className='col-md-6'>
            <form
              onMouseLeave={
                dirty
                  ? handleSubmit(handleEditAppointment)
                  : identity
              }
              onSubmit={
                dirty
                  ? handleSubmit(handleEditAppointment)
                  : identity
              }
            >
              <FormSection name='appointment'>
                <PrivateRevenue appointment={appointment} />
                <Tags
                  appointment={appointment}
                  allowedTags={allowedTags}
                  maxDuration={maxDuration}
                  assignee={assignee}
                  calendar={calendar}
                  change={change}
                />
              </FormSection>
              <input type='submit' style={{ display: 'none' }} />
            </form>
          </div>

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
              onSubmit={
                dirty
                  ? handleSubmit(handleEditPatient)
                  : identity
              }>
              <FormSection name='patient'>
                <PatientNotes patient={patient} />
                {/* Show first if not agreed yet */}
                <Consent appointment={appointment} calendar={calendar} showOnly='pending' />
                <Agreements patient={patient} calendarId={appointment.calendarId} showOnly='pending' />
                <br />
                <Consent appointment={appointment} calendar={calendar} showOnly='agreed' />
                <Agreements patient={patient} calendarId={appointment.calendarId} showOnly='agreed' />
                <TotalRevenue value={totalPatientRevenue} />
              </FormSection>

              <ListItem>
                <br />
                <Logs format={logFormat} doc={appointment} />
                <Stamps
                  collectionName='appointments'
                  fields={['removed', 'created', 'admitted', 'canceled']}
                  doc={appointment} />
              </ListItem>

              <input type='submit' style={{ display: 'none' }} />
            </form>
          }
        </div>
      </div>
    )
  }
}
