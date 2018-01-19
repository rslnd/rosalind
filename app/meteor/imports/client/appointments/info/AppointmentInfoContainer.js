import { connect } from 'react-redux'
import { touch, reduxForm, formValueSelector } from 'redux-form'
import Alert from 'react-s-alert'
import sum from 'lodash/sum'
import identity from 'lodash/identity'
import { TAPi18n } from 'meteor/tap:i18n'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Appointments } from '../../../api/appointments'
import { Patients } from '../../../api/patients'
import { Users } from '../../../api/users'
import { Comments } from '../../../api/comments'
import { Calendars } from '../../../api/calendars'
import { AppointmentInfo } from './AppointmentInfo'
import { translateObject } from '../../components/form/translateObject'
import { mapPatientToFields } from '../../patients/mapPatientToFields'

const formName = 'appointmentInfoForm'

let AppointmentInfoContainer = reduxForm({
  form: formName,
  enableReinitialize: true,
  updateUnregisteredFields: true,
  keepDirtyOnReinitialize: false,
  pure: false,
  onChange: (values, dispatch, props) => {
    console.log('onChange', values)
  },
  fields: [
    'tags',
    'contacts',
    'address'
  ],
  // validate: (values) => translateObject(validate(values))
})(AppointmentInfo)

// const selector = formValueSelector(formName)
// AppointmentInfoContainer = connect(mapPatientStateToProps(selector))(AppointmentInfoContainer)

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

    const patientFields =mapPatientToFields(patient)
    const initialValues = {
      tags: appointment.tags,
      ...patientFields
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

    const handleEditPatientNote = (newNote) => {
      patient && Patients.actions.editNote.callPromise({
        patientId: patient._id,
        newNote: newNote
      }).then(() => {
        Alert.success(TAPi18n.__('patients.editSuccess'))
      })
    }

    const handleEditPatient = (newPatient) => {
      Patients.actions.upsert.callPromise({
        patient: {
          _id: patient._id,
          ...newPatient
        }
      }).then(() => {
        Alert.success(TAPi18n.__('patients.editSuccess'))
      })
    }

    const handleSetBirthday = (newBirthday) => {
      Patients.actions.setBirthday.callPromise({
        patientId: patient._id,
        birthday: newBirthday
      }).then(() => {
        Alert.success(TAPi18n.__('patients.editSuccess'))
      })
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

    const handleTagChange = (newTags) => {
      Appointments.actions.setTags.callPromise({
        appointmentId: props.appointmentId,
        newTags
      }).then(() => {
        Alert.success(TAPi18n.__('appointments.editSuccess'))
      })
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
      handleEditPatientNote,
      handleEditPatient,
      handleToggleGender,
      handleTagChange,
      handleSetBirthday,
      handleSetMessagePreferences
    })
  }
}

AppointmentInfoContainer = composeWithTracker(composer)(AppointmentInfoContainer)

export { AppointmentInfoContainer }
