import { connect } from 'react-redux'
import { compose, withHandlers } from 'recompose'
import { PatientPickerComponent } from './PatientPickerComponent'
import {
  changeInputValue,
  changeValue
} from './actions'

import { Patients } from '../../../api/patients'

const mapStateToProps = state => ({
  selectState: {
    inputValue: state.patientPicker.inputValue,
    value: state.patientPicker.patient,
    options: Patients.find({}, {limit: 10}).fetch()
  }
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  selectHandlers: {
    onInputChange: (newValue, { action }) =>
      dispatch(changeInputValue(newValue, action)),
    onChange: (newPatient, { action }) =>
      dispatch(changeValue(newPatient, action, ownProps))
  }
})

export const PatientPicker = compose(
  connect(mapStateToProps, mapDispatchToProps)
)(PatientPickerComponent)

export const PatientPickerField = withHandlers({})(PatientPicker)
