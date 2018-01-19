import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Loading } from '../components/Loading'
import { Appointments } from '../../api/appointments'
import { Patients } from '../../api/patients'
import { PastAppointments } from './PastAppointments'

const composer = (props, onData) => {
  const patientId = props.patientId
  Meteor.subscribe('appointmentsPatient', { patientId })

  const patient = Patients.findOne({ _id: patientId })

  const _id = { $not: props.currentAppointmentId }
  const options = {
    sort: { start: -1 },
    removed: true
  }

  const currentAppointment = Appointments.findOne({ _id: props.currentAppointmentId })
  const pastAppointments = Appointments.find({ patientId, start: { $lt: new Date() }, _id }, options).fetch()
  const futureAppointments = Appointments.find({ patientId, start: { $gte: new Date() }, _id }, options).fetch()

  onData(null, { ...props, patient, currentAppointment, pastAppointments, futureAppointments })
}

const PastAppointmentsContainer = composeWithTracker(composer, Loading)(PastAppointments)

export { PastAppointmentsContainer }
