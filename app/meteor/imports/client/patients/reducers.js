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
