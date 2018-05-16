import moment from 'moment-timezone'
import { toClass } from 'recompose'
import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { withRouter } from 'react-router-dom'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Patients } from '../../../api/patients'
import { Calendars } from '../../../api/calendars'
import { Appointments } from '../../../api/appointments'
import { AppointmentActions } from './AppointmentActions'

const composer = (props, onData) => {
  const appointment = Appointments.findOne({ _id: props.appointmentId })
  if (!appointment) { return }

  const { admitted, canceled } = appointment
  const args = { appointmentId: props.appointmentId }
  const closeModal = () => props.onClose && props.onClose()

  const setAdmitted = () => {
    props.onSetAdmitted(appointment)
    closeModal()
  }

  const unsetAdmitted = () => {
    Alert.success(__('appointments.unsetAdmittedSuccess'))
    closeModal()
    Appointments.actions.unsetAdmitted.call(args)
  }

  const setCanceled = () => {
    Alert.success(__('appointments.setCanceledSuccess'))
    closeModal()
    Appointments.actions.setCanceled.call(args)
  }

  const unsetCanceled = () => {
    Alert.success(__('appointments.unsetCanceledSuccess'))
    closeModal()
    Appointments.actions.unsetCanceled.call(args)
  }

  const softRemove = () => {
    Alert.success(__('appointments.softRemoveSuccess'))
    closeModal()
    Appointments.actions.softRemove.callPromise(args)
  }

  let startMove
  if (props.onStartMove) {
    startMove = () => {
      let patient = null
      if (appointment.patientId) {
        patient = Patients.findOne({ _id: appointment.patientId })
      }

      props.onStartMove({
        appointment,
        patient
      })
    }
  }

  let viewInCalendar
  if (props.viewInCalendar) {
    viewInCalendar = () => {
      closeModal()
      const calendarSlug = Calendars.findOne(appointment.calendarId).slug
      const date = moment(appointment.start).format('YYYY-MM-DD')
      props.history.push(`/appointments/${calendarSlug}/${date}#${props.appointmentId}`)
    }
  }

  onData(null, {
    canceled,
    admitted,
    setAdmitted,
    unsetAdmitted,
    setCanceled,
    unsetCanceled,
    softRemove,
    startMove,
    viewInCalendar
  })
}

export const AppointmentActionsContainer = withRouter(toClass(composeWithTracker(composer)(toClass(AppointmentActions))))
