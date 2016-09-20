import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { PatientPicker } from './PatientPicker'

const composer = (props, onData) => {
  onData(null, { })
}

const PatientPickerContainer = composeWithTracker(composer)(PatientPicker)

export { PatientPickerContainer }
