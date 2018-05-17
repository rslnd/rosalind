import { connect } from 'react-redux'
import { touch, reduxForm, formValueSelector } from 'redux-form'
import { withProps } from 'recompose'
import Alert from 'react-s-alert'
import sum from 'lodash/sum'
import isEqual from 'lodash/isEqual'
import identity from 'lodash/identity'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../../i18n'
import { withTracker } from 'meteor/react-meteor-data'
import { Appointments } from '../../../api/appointments'
import { Patients } from '../../../api/patients'
import { Users } from '../../../api/users'
import { Comments } from '../../../api/comments'
import { Calendars } from '../../../api/calendars'
import { subscribe } from '../../../util/meteor/subscribe'
import { AppointmentInfo } from './AppointmentInfo'
import { calculateRevenue } from '../new/RevenueField'
import { translateObject } from '../../components/form/translateObject'
import { mapPatientToFields } from '../../patients/mapPatientToFields'
import { mapFieldsToPatient } from '../../patients/mapFieldsToPatient'

const formName = 'appointmentInfoForm'

let AppointmentInfoContainer = reduxForm({
  form: formName,
  enableReinitialize: true,
  updateUnregisteredFields: true,
  keepDirtyOnReinitialize: false,
  pure: false
  // validate: (values) => translateObject(validate(values))
})(AppointmentInfo)

const composer = props => {
  const subscription = subscribe('appointment', { appointmentId: props.appointmentId })
  const appointment = Appointments.findOne({ _id: props.appointmentId }, { removed: true })

  if (!appointment) { return }

  const loading = appointment.patientId && !subscription.ready()

  if (appointment) {
    const patient = Patients.findOne({ _id: appointment.patientId })
    const assignee = Users.findOne({ _id: appointment.assigneeId })
    const comments = patient ? Comments.find({
      docId: patient._id
    }, {
      sort: { createdAt: 1 }
    }).fetch() : []
    const calendar = Calendars.findOne({ _id: appointment.calendarId })

    const initialPatientFields = mapPatientToFields(patient)
    const initialAppointmentFields = {
      tags: appointment.tags,
      revenue: appointment.revenue,
      note: appointment.note
    }
    const initialValues = {
      appointment: initialAppointmentFields,
      patient: initialPatientFields
    }

    // TODO: Move into action
    let totalPatientRevenue = null
    if (patient) {
      const pastAppointments = Appointments.find({
        patientId: patient._id
      }).fetch()

      totalPatientRevenue = (patient.externalRevenue || 0) +
        sum(pastAppointments.map(p => p.revenue).filter(identity))
    }

    const handleEditPatient = v => {
      if (!isEqual(initialPatientFields, v.patient)) {
        const patient = mapFieldsToPatient(v.patient)

        return Patients.actions.upsert.callPromise({
          patient: {
            ...patient,
            _id: patient._id
          },
          replaceContacts: true
        })
        .then(() => Alert.success(__('patients.editSuccess')))
        .catch(e => {
          Alert.error('Bitte noch einmal versuchen')
          console.error(e)
        })
      }
    }

    const handleEditAppointment = v => {
      if (!isEqual(initialAppointmentFields, v.appointment)) {
        return Appointments.actions.update.callPromise({
          appointmentId: appointment._id,
          update: v.appointment
        })
        .then(() => Alert.success(__('appointments.editSuccess')))
        .catch(e => {
          Alert.error('Bitte noch einmal versuchen')
          console.error(e)
        })
      }
    }

    const handleToggleGender = () => {
      Patients.actions.toggleGender.callPromise({
        patientId: patient._id
      }).then(() => {
        Alert.success(__('patients.editSuccess'))
      })
    }

    const handleSetMessagePreferences = (newValue) => {
      const noSMS = !newValue.value

      if (patient) {
        if (noSMS) {
          Alert.success(__('patients.messagesDisabledSuccess'))
        } else {
          Alert.success(__('patients.messagesEnabledSuccess'))
        }

        Patients.actions.setMessagePreferences.call({
          patientId: patient._id,
          noSMS
        })
      }
    }

    return {
      ...props,
      loading,
      initialValues,
      calendar,
      appointment,
      patient,
      assignee,
      comments,
      totalPatientRevenue,
      handleEditPatient,
      handleEditAppointment,
      handleToggleGender,
      handleSetMessagePreferences
    }
  }
}

AppointmentInfoContainer = withTracker(composer)(AppointmentInfoContainer)

export { AppointmentInfoContainer }
