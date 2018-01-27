import { connect } from 'react-redux'
import { touch, reduxForm, formValueSelector } from 'redux-form'
import { withProps } from 'recompose'
import Alert from 'react-s-alert'
import sum from 'lodash/sum'
import isEqual from 'lodash/isEqual'
import identity from 'lodash/identity'
import { TAPi18n } from 'meteor/tap:i18n'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Appointments } from '../../../api/appointments'
import { Patients } from '../../../api/patients'
import { Users } from '../../../api/users'
import { Comments } from '../../../api/comments'
import { Calendars } from '../../../api/calendars'
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

const composer = (props, onData) => {
  const appointment = Appointments.findOne({ _id: props.appointmentId })

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
      revenue: appointment.revenue
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
        .then(() => Alert.success(TAPi18n.__('patients.editSuccess')))
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
        .then(() => Alert.success(TAPi18n.__('appointments.editSuccess')))
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
        Alert.success(TAPi18n.__('patients.editSuccess'))
      })
    }

    const handleSetMessagePreferences = (newValue) => {
      const noSMS = !newValue.value

      if (patient) {
        if (noSMS) {
          Alert.success(TAPi18n.__('patients.messagesDisabledSuccess'))
        } else {
          Alert.success(TAPi18n.__('patients.messagesEnabledSuccess'))
        }

        Patients.actions.setMessagePreferences.call({
          patientId: patient._id,
          noSMS
        })
      }
    }

    onData(null, {
      ...props,
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
    })
  }
}

AppointmentInfoContainer = composeWithTracker(composer)(AppointmentInfoContainer)

export { AppointmentInfoContainer }
