import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Appointments } from '../../../api/appointments'
import { Patients } from '../../../api/patients'
import { Users } from '../../../api/users'
import { Comments } from '../../../api/comments'
import { Calendars } from '../../../api/calendars'
import { AppointmentModal } from './AppointmentModal'

const composer = (props, onData) => {
  const appointment = Appointments.findOne({ _id: props.appointmentId })

  if (appointment) {
    const patient = Patients.findOne({ _id: appointment.patientId })
    const assignee = Users.findOne({ _id: appointment.assigneeId })
    const comments = patient ? Comments.find({
      docId: patient._id
    }, {
      sort: { createdAt: 1 }
    }).fetch() : []
    const calendar = Calendars.findOne({ _id: appointment.calendarId })

    onData(null, {
      ...props,
      calendar,
      appointment,
      patient,
      assignee,
      comments
    })
  }
}

const AppointmentModalContainer = composeWithTracker(composer)(AppointmentModal)

export { AppointmentModalContainer }
