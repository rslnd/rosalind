import keyBy from 'lodash/fp/keyBy'
import { withTracker } from '../components/withTracker'
import { Appointments } from '../../api/appointments'
import { Patients } from '../../api/patients'
import { Calendars } from '../../api/calendars'
import { PastAppointments } from './PastAppointments'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props) => {
  const patientId = props.patientId
  if (!patientId) { return {} }

  subscribe('appointments-patient', { patientId })

  const patient = Patients.findOne({ _id: patientId })

  const _id = { $not: props.currentAppointmentId }
  const options = {
    sort: { start: -1 },
    removed: true
  }

  const calendars = keyBy('_id')(Calendars.find({}).fetch())
  console.log(calendars)

  const currentAppointment = props.currentAppointmentId && Appointments.findOne({ _id: props.currentAppointmentId }, { removed: true })

  const pastAppointments = Appointments.find({ patientId, start: { $lt: new Date() }, _id }, options).fetch().map(a => ({ ...a, calendar: calendars[a.calendarId] }))

  const futureAppointments = Appointments.find({ patientId, start: { $gte: new Date() }, _id }, options).fetch().map(a => ({ ...a, calendar: calendars[a.calendarId] }))

  return {
    ...props,
    patient,
    currentAppointment: { ...currentAppointment, calendar: calendars[currentAppointment.calendarId] },
    pastAppointments,
    futureAppointments
  }
}

const PastAppointmentsContainer = withTracker(composer)(PastAppointments)

export { PastAppointmentsContainer }
