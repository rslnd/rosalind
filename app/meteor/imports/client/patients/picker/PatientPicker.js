import { connect } from 'react-redux'
import { compose } from 'recompose'
import { PatientPickerComponent } from './PatientPickerComponent'
import { changeInputValue } from './actions'

const mapStateToProps = state => ({
  inputValue: state.patientPicker.inputValue
})

const mapDispatchToProps = dispatch => ({
  handleInputValueChange: (newValue, { action }) =>
    dispatch(changeInputValue(newValue, action))
})

export const PatientPicker = compose(
  connect(mapStateToProps, mapDispatchToProps)
)(PatientPickerComponent)
