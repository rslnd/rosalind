import moment from 'moment-timezone'
import { toClass } from 'recompose'
import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { withRouter } from 'react-router-dom'
import { withTracker } from '../../components/withTracker'
import { Patients } from '../../../api/patients'
import { Calendars } from '../../../api/calendars'
import { Appointments } from '../../../api/appointments'
import { AppointmentActions } from './AppointmentActions'
import { hasRole } from '../../../util/meteor/hasRole'
import { Meteor } from 'meteor/meteor'

const composer = (props) => {
  const appointment = props.appointment || Appointments.findOne({ _id: props.appointmentId })
  if (!appointment) { return }

  const { admitted, canceled, treatmentStart, treatmentEnd } = appointment
  const args = { appointmentId: props.appointmentId }
  const closeModal = () => props.onClose && props.onClose()

  const setAdmitted = () => {
    props.onSetAdmitted(appointment)
    closeModal()
  }

  const startTreatment = () => {
    Alert.success(__('appointments.startTreatmentSuccess'))
    Appointments.actions.startTreatment.call(args)
    closeModal()
  }

  const endTreatment = () => {
    Alert.success(__('appointments.endTreatmentSuccess'))
    Appointments.actions.endTreatment.call(args)
    closeModal()
  }

  const unsetAdmitted = () => {
    Alert.success(__('appointments.unsetAdmittedSuccess'))
    Appointments.actions.unsetAdmitted.call(args)
    closeModal()
  }

  const setCanceled = () => {
    Alert.success(__('appointments.setCanceledSuccess'))
    Appointments.actions.setCanceled.call(args)
    closeModal()
  }

  const unsetCanceled = () => {
    Alert.success(__('appointments.unsetCanceledSuccess'))
    Appointments.actions.unsetCanceled.call(args)
    closeModal()
  }

  const softRemove = () => {
    Alert.success(__('appointments.softRemoveSuccess'))
    Appointments.actions.softRemove.callPromise(args)
    closeModal()
  }

  let startMove
  if (props.onMoveStart) {
    startMove = () => {
      let patient = null
      if (appointment.patientId) {
        patient = Patients.findOne({ _id: appointment.patientId })
      }

      const calendar = Calendars.findOne({ _id: appointment.calendarId })

      props.onMoveStart({
        appointment,
        patient,
        allowMoveBetweenAssignees:
          hasRole(Meteor.userId(), ['allowMoveBetweenAssignees']) ||
          calendar.allowMoveBetweenAssignees
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

  return {
    canceled,
    admitted,
    treatmentStart,
    treatmentEnd,
    setAdmitted,
    startTreatment,
    endTreatment,
    unsetAdmitted,
    setCanceled,
    unsetCanceled,
    softRemove,
    startMove,
    viewInCalendar
  }
}

export const AppointmentActionsContainer = withRouter(toClass(withTracker(composer)(toClass(AppointmentActions))))
