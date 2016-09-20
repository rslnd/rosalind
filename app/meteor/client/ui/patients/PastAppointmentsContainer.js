import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { Loading } from 'client/ui/components/Loading'
import { Appointments } from 'api/appointments'
import { PastAppointments } from './PastAppointments'

const composer = (props, onData) => {
  const patientId = props.patientId
  const sub = Meteor.subscribe('appointmentsPatient', { patientId })

  if (sub.ready()) {
    const _id = { $not: props.excludeAppointmentId }
    const sort = { start: -1 }

    const pastAppointments = Appointments.find({ patientId, start: { $lt: new Date() }, _id }, { sort }).fetch()
    const futureAppointments = Appointments.find({ patientId, start: { $gte: new Date() }, _id }, { sort }).fetch()

    onData(null, { ...props, pastAppointments, futureAppointments })
  }
}

const PastAppointmentsContainer = composeWithTracker(composer, Loading)(PastAppointments)

export { PastAppointmentsContainer }
