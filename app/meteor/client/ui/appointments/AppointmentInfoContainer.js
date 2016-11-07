import { composeWithTracker } from 'react-komposer'
import { Appointments } from 'api/appointments'
import { Users } from 'api/users'
import { AppointmentInfo } from './AppointmentInfo'

const composer = (props, onData) => {
  const appointment = Appointments.findOne({ _id: props.appointmentId })
  const closeModal = () => props.onRequestClose && props.onRequestClose()
  const args = { appointmentId: props.appointmentId }

  if (appointment) {
    const assignee = Users.findOne({ _id: appointment.assigneeId })
    const setAdmitted = () => {
      Appointments.actions.setAdmitted.call(args)
      closeModal()
    }

    const unsetAdmitted = () => {
      Appointments.actions.unsetAdmitted.call(args)
      closeModal()
    }

    const setCanceled = () => {
      Appointments.actions.setCanceled.call(args)
      closeModal()
    }

    const unsetCanceled = () => {
      Appointments.actions.unsetCanceled.call(args)
      closeModal()
    }

    const softRemove = () => {
      Appointments.actions.softRemove.call(args)
      closeModal()
    }

    onData(null, { appointment, assignee, setAdmitted, unsetAdmitted, setCanceled, unsetCanceled, softRemove })
  }
}

export const AppointmentInfoContainer = composeWithTracker(composer)(AppointmentInfo)
