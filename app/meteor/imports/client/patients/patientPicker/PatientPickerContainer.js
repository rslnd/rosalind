import { connect } from 'react-redux'
import { PatientPicker } from './PatientPicker'

const PatientPickerContainer = connect(null, {
  loadPatient: data => ({ type: 'LOAD_PATIENT', data })
})(PatientPicker)

export { PatientPickerContainer }
