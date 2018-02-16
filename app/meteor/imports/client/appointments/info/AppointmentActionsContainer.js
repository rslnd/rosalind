import moment from 'moment-timezone'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { withRouter } from 'react-router-dom'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Patients } from '../../../api/patients'
import { Calendars } from '../../../api/calendars'
import { Appointments } from '../../../api/appointments'
import { AppointmentActions } from './AppointmentActions'

const composer = (props, onData) => {
  const appointment = Appointments.findOne({ _id: props.appointmentId })
  const { admitted, canceled } = appointment
  const args = { appointmentId: props.appointmentId }
  const closeModal = () => props.onClose && props.onClose()

  const setAdmitted = () => {
    Alert.success(TAPi18n.__('appointments.setAdmittedSuccess'))
    Appointments.actions.setAdmitted.call(args)
    closeModal()
  }

  const unsetAdmitted = () => {
    Alert.success(TAPi18n.__('appointments.unsetAdmittedSuccess'))
    Appointments.actions.unsetAdmitted.call(args)
    closeModal()
  }

  const setCanceled = () => {
    Alert.success(TAPi18n.__('appointments.setCanceledSuccess'))
    Appointments.actions.setCanceled.call(args)
    closeModal()
  }

  const unsetCanceled = () => {
    Alert.success(TAPi18n.__('appointments.unsetCanceledSuccess'))
    Appointments.actions.unsetCanceled.call(args)
    closeModal()
  }

  const softRemove = () => {
    Alert.success(TAPi18n.__('appointments.softRemoveSuccess'))
    Appointments.actions.softRemove.callPromise(args)
    closeModal()
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

export const AppointmentActionsContainer = withRouter(composeWithTracker(composer)(AppointmentActions))
