import { connect } from 'react-redux'
import { namecase } from '../../../util/namecase'
import { compose, withHandlers, mapProps, withProps } from 'recompose'
import { PatientPickerComponent } from './PatientPickerComponent'
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
  },
  previousInputValue: state.patientPicker.previousInputValue
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  selectHandlers: {
    onInputChange: (newValue, { action }) =>
      dispatch(changeInputValue(newValue, action, ownProps)),
    onChange: (newPatient, { action }) =>
      dispatch(changeValue(newPatient, action, ownProps))
  }
})

const withOption = option => props => ({
  ...props,
  selectState: {
    ...props.selectState,
    options: [
      option(props),
      ...(props.selectState.options || [])
    ]
  }
})

const isOptionSelected = ({ _id }, selected = []) =>
  selected.some(s => s._id === _id)

const filterOption = () => true

const newPatientOption = props => {
  const query = props.selectState.inputValue || props.previousInputValue
  const [lastName, firstName] = namecase(query).split(' ')

  return {
    patientId: 'newPatient',
    firstName,
    lastName
  }
}

export const PatientPicker = compose(
  connect(mapStateToProps, mapDispatchToProps),
  mapProps(withOption(newPatientOption)),
  withProps({ isOptionSelected, filterOption })
)(PatientPickerComponent)

export const PatientPickerField = withHandlers({})(PatientPicker)
