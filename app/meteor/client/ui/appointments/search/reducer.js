export const search = (state = { query: '' }, action) => {
  switch (action.type) {
    case 'APPOINTMENTS_SEARCH_QUERY_CHANGE':
      return {
        query: action.query
      }
    case 'DATA_TRANSFER_SUCCESS':
      if (action.importer === 'xdt') {
        return {
          patientId: action.result
        }
      }
      return state
    default:
      return state
  }
}
