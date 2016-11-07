import { connect } from 'react-redux'
import { composeWithTracker } from 'react-komposer'
import { Patients } from 'api/patients'
import { PatientPicker } from './PatientPicker'

const composer = (props, onData) => {
  if (props.input.value) {
    const patientId = props.input.value
    Patients.actions.findOne.callPromise({ _id: patientId })
      .then((patient) => {
        onData(null, {
          ...props,
          value: {
            value: `patient-${patientId}`,
            patient
          }
        })
      })
  } else {
    onData(null, { ...props })
  }
}

const PatientPickerContainer = connect()(composeWithTracker(composer)(PatientPicker))

export { PatientPickerContainer }
