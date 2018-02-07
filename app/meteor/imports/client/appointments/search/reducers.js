export const search = (state = {}, action) => {
  switch (action.type) {
    case 'APPOINTMENT_INSERT_SUCCESS':
      return {}
    case 'APPOINTMENTS_SEARCH_QUERY_CHANGE':
      return {
        query: action.query,
        patientId: null
      }
    case 'DATA_TRANSFER_SUCCESS':
      if (action.importer === 'xdt') {
        return {
          patientId: action.result,
          query: null
        }
      }
      return state
    case 'LOAD_PATIENT':
      if (action.data) {
        return {
          patientId: action.data._id,
          query: null
        }
      } else {
        return {}
      }
    default:
      return state
  }
}
