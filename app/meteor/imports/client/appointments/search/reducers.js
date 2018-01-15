export const search = (state = { query: '' }, action) => {
  switch (action.type) {
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
    default:
      return state
  }
}
