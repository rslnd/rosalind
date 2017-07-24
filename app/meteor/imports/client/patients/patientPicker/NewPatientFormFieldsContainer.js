import { connect } from 'react-redux'
import { NewPatientFormFields } from './NewPatientFormFields'

const mapDispatchToProps = (dispatch) => {
  return {
    swapNameFields: () => {
      dispatch({ type: 'NEW_PATIENT_SWAP_NAME_FIELDS' })
    }
  }
}

const NewPatientFormFieldsContainer = connect(null, mapDispatchToProps)(NewPatientFormFields)

export { NewPatientFormFieldsContainer }
