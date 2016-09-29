import { composeWithTracker } from 'react-komposer'
import { PatientPicker } from './PatientPicker'

const composer = (props, onData) => {
  onData(null, { ...props })
}

const PatientPickerContainer = composeWithTracker(composer)(PatientPicker)

export { PatientPickerContainer }
