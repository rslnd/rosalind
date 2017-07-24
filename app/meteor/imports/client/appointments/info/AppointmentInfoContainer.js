import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Appointments } from '../../../api/appointments'
import { Patients } from '../../../api/patients'
import { Users } from '../../../api/users'
import { AppointmentInfo } from './AppointmentInfo'

const composer = (props, onData) => {
  const appointment = Appointments.findOne({ _id: props.appointmentId })
  const patient = Patients.findOne({ _id: appointment.patientId })
  const args = { appointmentId: props.appointmentId }

  if (appointment) {
    const assignee = Users.findOne({ _id: appointment.assigneeId })

    const handleEditNote = (newNote) => {
      Appointments.actions.editNote.call({
        ...args,
        newNote: newNote
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
      appointment,
      patient,
      assignee,
      handleEditNote,
      handleEditPatient,
      handleToggleGender,
      handleTagChange,
      handleSetBirthday,
      handleSetMessagePreferences
    })
  }
}

export const AppointmentInfoContainer = composeWithTracker(composer)(AppointmentInfo)
