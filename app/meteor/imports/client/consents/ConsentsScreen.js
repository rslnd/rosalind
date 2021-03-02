import idx from 'idx'
import moment from 'moment-timezone'
import React, { useState } from 'react'
import Alert from 'react-s-alert'
import { Link } from 'react-router-dom'
import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import { Table } from '../components/InlineEditTable'
import { Box } from '../components/Box'
import { __ } from '../../i18n'
import { Media } from '../../api/media'
import { Meteor } from 'meteor/meteor'
import { TagsList } from '../tags/TagsList'
import { Appointments, Templates, Consents, Calendars, Patients, Users } from '../../api'
import { fullNameWithTitle } from '../../api/users/methods'
import { Icon } from '../components/Icon'
import { PatientsAppointmentsContainer } from '../patientAppointments/PatientsAppointmentsContainer'

const composer = () => {
  Meteor.subscribe('consents-pending')

  const consents = Consents.find({ scannedAt: null }).fetch().map(c => {
    const appointment = Appointments.findOne({ _id: c.appointmentId })
    const calendar = Calendars.findOne({ _id: appointment.calendarId })

    return {
      ...c,
      appointment,
      calendar,
      patient: Patients.findOne({ _id: c.patientId }),
      assignee: Users.findOne({ _id: c.assigneeId }),
      template: Templates.findOne({ _id: c.templateId })
    }
  })

  return {
    consents
  }
}

const pointerStyle = { cursor: 'pointer' }

const structure = () => [
  {
    header: '',
    render: c => c.calendar && <Icon name={c.calendar.icon} />,
    style: pointerStyle
  },
  {
    header: 'Termin',
    render: c => c.appointment && moment(c.appointment.start).format(__('time.dateFormat') + ' ' + __('time.timeFormat')),
    style: pointerStyle
  },
  {
    header: 'PatientIn',
    render: c => c.patient && fullNameWithTitle(c.patient),
    style: pointerStyle
  },
  {
    header: 'Behandlung',
    render: c => c.appointment && <TagsList tags={c.appointment.tags} />,
    style: pointerStyle
  },
  {
    header: 'Behandelt von',
    render: c => c.assignee && fullNameWithTitle(c.assignee),
    style: pointerStyle
  },
]

const Screen = ({ consents }) => {
  const [appointmentId, setAppointmentId] = useState(null)
  return <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Fehlende Reverse' icon='document'>
          <Table
            onClick={(c) => {
              console.log('OC', c)
              c && c.appointment && setAppointmentId(c.appointment._id)
            }} // openLinkToAppointment
            structure={structure}
            rows={consents}
          />
        </Box>
      </div>
    </div>

    <PatientsAppointmentsContainer
      show={!!appointmentId}
      onClose={() => setAppointmentId(null)}
      appointmentId={appointmentId ? appointmentId : undefined}
    />
  </div>
}

export const ConsentsScreen = withTracker(composer)(Screen)
