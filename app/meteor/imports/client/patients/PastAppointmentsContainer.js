import { withTracker } from 'meteor/react-meteor-data'
import { Loading } from '../components/Loading'
import { Appointments } from '../../api/appointments'
import { Patients } from '../../api/patients'
import { PastAppointments } from './PastAppointments'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props) => {
  const patientId = props.patientId
  if (!patientId) { return }

  subscribe('appointments-patient', { patientId })

  const patient = Patients.findOne({ _id: patientId })

  const _id = { $not: props.currentAppointmentId }
  const options = {
    sort: { start: -1 },
    removed: true
  }

  const currentAppointment = Appointments.findOne({ _id: props.currentAppointmentId })
  const pastAppointments = Appointments.find({ patientId, start: { $lt: new Date() }, _id }, options).fetch()
  const futureAppointments = Appointments.find({ patientId, start: { $gte: new Date() }, _id }, options).fetch()

  return { ...props, patient, currentAppointment, pastAppointments, futureAppointments }
}

const PastAppointmentsContainer = withTracker(composer, Loading)(PastAppointments)

export { PastAppointmentsContainer }
