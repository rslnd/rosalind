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
import { prompt } from '../../layout/Prompt'

const composer = (props) => {
  const appointment = props.appointment || Appointments.findOne({ _id: props.appointmentId })

  const { queued, admitted, canceled, treatmentStart, treatmentEnd } = (appointment || {})

  const args = { appointmentId: props.appointmentId }
  const patientId = props.patientId || (props.appointment && props.appointment.patientId)
  const patient = patientId && Patients.findOne({ _id: patientId })
  const calendar = appointment && Calendars.findOne({ _id: appointment.calendarId })

  const closeModal = () => props.onClose && props.onClose()

  const setDismissed = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.setDismissed'))
    Appointments.actions.setDismissed.call(args)
  })

  const setQueued = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.setQueued'))
    Appointments.actions.setQueued.call(args)
  })

  const setAdmitted = appointment && (() => {
    closeModal()
    props.onSetAdmitted(appointment)
  })

  const startTreatment = appointment && (async () => {
    const missingConsent = true // TODO check new checklist collection
    const isAssignee = (Meteor.userId() === appointment.assigneeId || Meteor.userId() === appointment.waitlistAssigneeId)
    const needsGating = hasRole(Meteor.userId(), ['gate-consent'])
    if (missingConsent && isAssignee && needsGating) {
      await prompt({
        title: 'Bitte zuerst einen unterschriebenen Revers für diese Behandlung einscannen.',
        confirm: 'OK',
        cancel: ' '
      })
      return
    }

    closeModal()
    Alert.success(__('appointments.startTreatmentSuccess'))
    Appointments.actions.startTreatment.call(args)
  })

  const endTreatment = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.endTreatmentSuccess'))
    Appointments.actions.endTreatment.call(args)
  })

  const unsetDismissed = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.unsetDismissed'))
    Appointments.actions.unsetDismissed.call(args)
  })

  const unsetQueued = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.unsetQueued'))
    Appointments.actions.unsetQueued.call(args)
  })

  const unsetAdmitted = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.unsetAdmittedSuccess'))
    Appointments.actions.unsetAdmitted.call(args)
  })

  const setCanceled = appointment && (() => {
    Alert.success(__('appointments.setCanceledSuccess'))
    Appointments.actions.setCanceled.call(args)
  })

  const setNoShow = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.setNoShowSuccess'))
    Appointments.actions.setNoShow.call(args)
  })

  const unsetCanceled = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.unsetCanceledSuccess'))
    Appointments.actions.unsetCanceled.call(args)
  })

  const unsetStartTreatment = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.unsetStartTreatmentSuccess'))
    Appointments.actions.unsetStartTreatment.call(args)
  })

  const unsetEndTreatment = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.unsetEndTreatmentSuccess'))
    Appointments.actions.unsetEndTreatment.call(args)
  })

  const softRemove = appointment && (() => {
    closeModal()
    Alert.success(__('appointments.softRemoveSuccess'))
    Appointments.actions.softRemove.callPromise(args)
  })

  let move
  if (appointment && props.onMoveStart) {
    move = () => {
      searchForPatient({ notify: false })
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
  if (appointment && props.viewInCalendar) {
    viewInCalendar = () => {
      closeModal()
      const date = moment(appointment.start).format('YYYY-MM-DD')
      props.history.push(`/appointments/${calendar.slug}/${date}#${props.appointmentId}`)
    }
  }

  // Put patient into search box
  const searchForPatient = ({ notify = true } = {}) => {
    if (patient) {
      props.dispatch({
        type: 'PATIENT_CHANGE_VALUE',
        patient
      })
    }
    closeModal()
    if (notify) {
      Alert.success('PatientIn in Suche übernommen')
    }
  }

  return {
    appointment,
    calendar,
    canceled,
    admitted,
    queued,
    treatmentStart,
    treatmentEnd,
    setDismissed,
    setQueued,
    setAdmitted,
    startTreatment,
    endTreatment,
    unsetDismissed,
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
