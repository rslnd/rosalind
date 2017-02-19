import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Appointments } from 'api/appointments'
import { AppointmentActions } from './AppointmentActions'

const composer = (props, onData) => {
  const appointment = Appointments.findOne({ _id: props.appointmentId })
  const { admitted, canceled } = appointment
  const args = { appointmentId: props.appointmentId }
  const closeModal = () => props.onClose && props.onClose()

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

  const startMove = () => {
    props.onStartMove(args)
  }

  onData(null, {
    canceled,
    admitted,
    setAdmitted,
    unsetAdmitted,
    setCanceled,
    unsetCanceled,
    softRemove,
    startMove
  })
}

export const AppointmentActionsContainer = composeWithTracker(composer)(AppointmentActions)
