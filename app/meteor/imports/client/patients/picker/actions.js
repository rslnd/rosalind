export const PATIENT_CHANGE_INPUT_VALUE = 'PATIENT_CHANGE_INPUT_VALUE'
export const PATIENT_CHANGE_VALUE = 'PATIENT_CHANGE_VALUE'

export const changeInputValue = (inputValue, fieldAction) => ({
  type: PATIENT_CHANGE_INPUT_VALUE,
  inputValue,
  fieldAction
})

export const changeValue = (patient, fieldAction, ownProps) => {
  if (ownProps.input) {
    const patientId = (patient && patient._id || null)
    ownProps.input.onChange(patientId)
    ownProps.input.onBlur(patientId)
  }

  return {
    type: PATIENT_CHANGE_VALUE,
    patient,
    fieldAction
  }
}
