import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Loading } from '../components/Loading'
import { Appointments } from '../../api/appointments'
import { PastAppointments } from './PastAppointments'

const composer = (props, onData) => {
  const patientId = props.patientId
  Meteor.subscribe('appointmentsPatient', { patientId })

  const _id = { $not: props.excludeAppointmentId }
  const options = {
    sort: { start: -1 },
    removed: true
  }

  const pastAppointments = Appointments.find({ patientId, start: { $lt: new Date() }, _id }, options).fetch()
  const futureAppointments = Appointments.find({ patientId, start: { $gte: new Date() }, _id }, options).fetch()

  onData(null, { ...props, pastAppointments, futureAppointments })
}

const PastAppointmentsContainer = composeWithTracker(composer, Loading)(PastAppointments)

export { PastAppointmentsContainer }
