import idx from 'idx'
import moment from 'moment-timezone'
import React from 'react'
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

const structure = () => [
  {
    header: '',
    render: c => c.calendar && <Icon name={c.calendar.icon} />
  },
  {
    header: 'Termin',
    render: c => c.appointment && moment(c.appointment.start).format(__('time.dateFormat') + ' ' + __('time.timeFormat'))
  },
  {
    header: 'PatientIn',
    render: c => c.patient && fullNameWithTitle(c.patient)
  },
  {
    header: 'Behandlung',
    render: c => c.appointment && <TagsList tags={c.appointment.tags} />
  },
  {
    header: 'Behandelt von',
    render: c => c.assignee && fullNameWithTitle(c.assignee)
  },
]

const Screen = toClass(({ consents }) =>
  <div className='content'>
    <div className='row'>
      <div className='col-md-12'>
        <Box title='Noch nicht eingescannte Reverse' icon='document'>
          <Table
            structure={structure}
            rows={consents}
          />
        </Box>
      </div>
    </div>
  </div>
)

export const ConsentsScreen = withTracker(composer)(Screen)
