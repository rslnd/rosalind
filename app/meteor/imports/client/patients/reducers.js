export const loadPatient = (state = {}, action) => {
  switch (action.type) {
    case 'LOAD_PATIENT':
      return {
        data: action.data
      }

    case 'DATA_TRANSFER_SUCCESS':
      if (action.importer === 'xdt') {
        return {
          data: action.result
        }
      }
      return state

    default:
      return state
  }
}
