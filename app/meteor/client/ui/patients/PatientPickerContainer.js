import { connect } from 'react-redux'
import { PatientPicker } from './PatientPicker'

const PatientPickerContainer = connect()(PatientPicker)

export { PatientPickerContainer }
