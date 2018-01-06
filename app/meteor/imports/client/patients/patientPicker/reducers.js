export const patientPicker = (state = {}, action) => {
  switch (action.type) {
    case 'OPEN_NEW_PATIENT':
      return { ...state,
        values: {
          ...state.values,
          gender: action.autofill.gender,
          firstName: action.autofill.firstName,
          lastName: action.autofill.lastName,
          telephone: null,
          email: null,
          birthday: null
        }
      }
    case 'CLOSE_NEW_PATIENT':
      return { ...state,
        values: {
          ...state.values,
          firstName: null,
          lastName: null,
          telephone: null,
          email: null,
          birthday: null
        }
      }
    default:
      return state
  }
}
