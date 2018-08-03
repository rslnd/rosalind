export const PATIENT_CHANGE_INPUT_VALUE = 'PATIENT_CHANGE_INPUT_VALUE'

export const changeInputValue = (inputValue, fieldAction) => ({
  type: PATIENT_CHANGE_INPUT_VALUE,
  inputValue,
  fieldAction
})
