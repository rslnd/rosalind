export const patientPicker = (state = {}, action) => {
  switch (action.type) {
    case 'OPEN_NEW_PATIENT':
      return { ...state,
        values: action.autofill
      }
    case 'CLOSE_UPSERT':
      return {}
    default:
      return state
  }
}

export const loadPatient = (state = {}, action) => {
  switch (action.type) {
    case 'LOAD_PATIENT':
      return {
        data: action.data
      }
    default:
      return state
  }
}
