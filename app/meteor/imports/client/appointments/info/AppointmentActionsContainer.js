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

  const { queued, admitted, canceled, treatmentStart, treatmentEnd } = appointment
  const args = { appointmentId: props.appointmentId }
  const patient = appointment.patientId && Patients.findOne({ _id: appointment.patientId })

  const closeModal = () => props.onClose && props.onClose()

  const setQueued = () => {
    closeModal()
    Alert.success(__('appointments.setQueued'))
    Appointments.actions.setQueued.call(args)
  }

  const setAdmitted = () => {
    closeModal()
    props.onSetAdmitted(appointment)
  }

  const startTreatment = () => {
    closeModal()
    Alert.success(__('appointments.startTreatmentSuccess'))
    Appointments.actions.startTreatment.call(args)
  }

  const endTreatment = () => {
    closeModal()
    Alert.success(__('appointments.endTreatmentSuccess'))
    Appointments.actions.endTreatment.call(args)
  }

  const unsetQueued = () => {
    closeModal()
    Alert.success(__('appointments.unsetQueued'))
    Appointments.actions.unsetQueued.call(args)
  }

  const unsetAdmitted = () => {
    closeModal()
    Alert.success(__('appointments.unsetAdmittedSuccess'))
    Appointments.actions.unsetAdmitted.call(args)
  }

  const setCanceled = () => {
    Alert.success(__('appointments.setCanceledSuccess'))
    Appointments.actions.setCanceled.call(args)
  }

  const setNoShow = () => {
    closeModal()
    Alert.success(__('appointments.setNoShowSuccess'))
    Appointments.actions.setNoShow.call(args)
  }

  const unsetCanceled = () => {
    closeModal()
    Alert.success(__('appointments.unsetCanceledSuccess'))
    Appointments.actions.unsetCanceled.call(args)
  }

  const unsetStartTreatment = () => {
    closeModal()
    Alert.success(__('appointments.unsetStartTreatmentSuccess'))
    Appointments.actions.unsetStartTreatment.call(args)
  }

  const unsetEndTreatment = () => {
    closeModal()
    Alert.success(__('appointments.unsetEndTreatmentSuccess'))
    Appointments.actions.unsetEndTreatment.call(args)
  }

  const softRemove = () => {
    closeModal()
    Alert.success(__('appointments.softRemoveSuccess'))
    Appointments.actions.softRemove.callPromise(args)
  }

  let move
  if (props.onMoveStart) {
    move = () => {
      const calendar = Calendars.findOne({ _id: appointment.calendarId })
      searchForPatient()
      props.onMoveStart({
        appointment: { ...appointment, patient },
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

  // Put patient into search box
  const searchForPatient = () => {
    if (patient) {
      props.dispatch({
        type: 'PATIENT_CHANGE_VALUE',
        patient
      })
    }
    closeModal()
  }

  return {
    appointment,
    canceled,
    admitted,
    queued,
    treatmentStart,
    treatmentEnd,
    setQueued,
    setAdmitted,
    startTreatment,
    endTreatment,
    unsetQueued,
    unsetAdmitted,
    setCanceled,
    setNoShow,
    unsetCanceled,
    unsetStartTreatment,
    unsetEndTreatment,
    softRemove,
    move,
    viewInCalendar,
    searchForPatient
  }
}

export const AppointmentActionsContainer = withRouter(toClass(withTracker(composer)(toClass(AppointmentActions))))
