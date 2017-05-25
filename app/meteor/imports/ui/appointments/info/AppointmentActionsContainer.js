import moment from 'moment-timezone'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { withRouter } from 'react-router-dom'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Patients } from '../../../api/patients'
import { Appointments } from '../../../api/appointments'
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
    Appointments.actions.softRemove.callPromise(args).then(() => {
      Alert.success(TAPi18n.__('appointments.softRemoveSuccess'))
    })
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
      const slug = moment(appointment.start).format('YYYY-MM-DD')
      props.history.push(`/appointments/${slug}#${props.appointmentId}`)
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
