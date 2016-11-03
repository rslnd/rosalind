import { composeWithTracker } from 'react-komposer'
import { Appointments } from 'api/appointments'
import { Users } from 'api/users'
import { AppointmentInfo } from './AppointmentInfo'

const composer = (props, onData) => {
  const appointment = Appointments.findOne({ _id: props.appointmentId })
  if (appointment) {
    const assignee = Users.findOne({ _id: appointment.assigneeId })
    const setAdmitted = () => Appointments.actions.setAdmitted.call({ appointmentId: props.appointmentId })
    const unsetAdmitted = () => Appointments.actions.unsetAdmitted.call({ appointmentId: props.appointmentId })
    const setCanceled = () => Appointments.actions.setCanceled.call({ appointmentId: props.appointmentId })
    const unsetCanceled = () => Appointments.actions.unsetCanceled.call({ appointmentId: props.appointmentId })
    const softRemove = () => Appointments.actions.softRemove.call({ appointmentId: props.appointmentId })

    onData(null, { appointment, assignee, setAdmitted, unsetAdmitted, setCanceled, unsetCanceled, softRemove })
  }
}

export const AppointmentInfoContainer = composeWithTracker(composer)(AppointmentInfo)
