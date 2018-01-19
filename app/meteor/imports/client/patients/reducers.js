export const loadPatient = (state = {}, action) => {
  switch (action.type) {
    case 'LOAD_PATIENT':
      return {
        data: action.data
      }
    case 'APPOINTMENT_INSERT_SUCCESS':
      return null
    default:
      return state
  }
}
