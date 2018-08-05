import { connect } from 'react-redux'
import { compose, withHandlers, mapProps, branch, withProps, renderComponent } from 'recompose'
import { PatientPickerComponent, NewPatient } from './PatientPickerComponent'
import { PatientName } from '../PatientName'
import {
  changeInputValue,
  changeValue
} from './actions'

const mapStateToProps = state => ({
  selectState: {
    inputValue: state.patientPicker.inputValue,
    value: state.patientPicker.patient,
    options: state.patientPicker.options,
    isLoading: state.patientPicker.isLoading
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

const withOption = option => props => ({
  ...props,
  selectState: {
    ...props.selectState,
    options: [
      option,
      ...props.selectState.options
    ]
  }
})

const CustomOptionComponent = compose(
  branch(p => p.patientId === 'newPatient', renderComponent(NewPatient)),
  mapProps(patient => ({ patient }))
)(PatientName)

const isOptionSelected = ({ _id }, selected = []) =>
  selected.some(s => s._id === _id)

const filterOption = () => true

export const PatientPicker = compose(
  connect(mapStateToProps, mapDispatchToProps),
  branch(p => p.upsert, mapProps(withOption({ patientId: 'newPatient' }))),
  withProps({ CustomOptionComponent, isOptionSelected, filterOption })
)(PatientPickerComponent)

export const PatientPickerField = withHandlers({})(PatientPicker)
