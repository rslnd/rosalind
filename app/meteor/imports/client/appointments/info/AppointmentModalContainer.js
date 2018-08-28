import Alert from 'react-s-alert'
import { toClass } from 'recompose'
import { withTracker } from '../../components/withTracker'
import { Appointments } from '../../../api/appointments'
import { Patients } from '../../../api/patients'
import { Users } from '../../../api/users'
import { Comments } from '../../../api/comments'
import { Calendars } from '../../../api/calendars'
import { AppointmentModal } from './AppointmentModal'

const composer = (props) => {
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

    return {
      ...props,
      calendar,
      appointment,
      patient,
      assignee,
      comments
    }
  }
}

const AppointmentModalContainer = withTracker(composer)(toClass(AppointmentModal))

export { AppointmentModalContainer }
