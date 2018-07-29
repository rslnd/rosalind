import idx from 'idx'
import { connect } from 'react-redux'
import { withPromise } from '../components/withPromise'
import { Patients } from '../../api/patients'
import { PatientPicker } from './PatientPicker'

const composer = (props) => {
  if (props.input.value || props.patientId) {
    const inputValue = (typeof props.input.value === 'string')
      ? props.input.value
      : (typeof props.input.value === 'object')
        ? props.input.value.patientId
        : null
    const patientId = inputValue || props.patientId

    if (patientId === 'newPatient' || patientId === '') {
      return Promise.resolve(props)
    } else {
      const patient = Patients.findOne({ _id: patientId })

      if (patient) {
        return Promise.resolve({
          ...props,
          injectedValue: {
            patientId,
            patient
          }
        })
      }

      return Patients.actions.findOne.callPromise({ _id: patientId })
        .then((patient) => {
          if (props.patientId && !props.input.value) {
            props.loadPatient(patient)
          }

          return {
            ...props,
            injectedValue: {
              patientId,
              patient
            }
          }
        })
    }
  } else {
    return Promise.resolve(props)
  }
}

let PatientPickerContainer = withPromise(composer)(PatientPicker)

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
