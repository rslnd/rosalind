import idx from 'idx'
import { connect } from 'react-redux'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Patients } from '../../api/patients'
import { PatientPicker } from './PatientPicker'
import { mapStateToProps } from './mapStateToProps';

const composer = (props, onData) => {
  if (props.input.value || props.patientId) {
    const patientId = props.input.value || props.patientId

    if (patientId === 'newPatient' || patientId === '') {
      return onData(null, { ...props })
    } else {
      const patient = Patients.findOne({ _id: patientId })

      if (patient) {
        onData(null, {
          ...props,
          injectedValue: {
            patientId,
            patient
          }
        })
      }

      Patients.actions.findOne.callPromise({ _id: patientId })
        .then((patient) => {
          if (props.patientId && !props.input.value) {
            props.loadPatient(patient)
          }

          onData(null, {
            ...props,
            injectedValue: {
              patientId,
              patient
            }
          })
        })
    }
  } else {
    onData(null, { ...props })
  }
}

let PatientPickerContainer = composeWithTracker(composer)(PatientPicker)

PatientPickerContainer = connect(state => {
  const patientId = idx(state, _ => _.appointments.search.patientId)

  if (patientId) {
    return {
      patientId
    }
  } else {
    return {}
  }
}, {
  loadPatient: data => {
    return { type: 'LOAD_PATIENT', data }
  }
})(PatientPickerContainer)

export { PatientPickerContainer }