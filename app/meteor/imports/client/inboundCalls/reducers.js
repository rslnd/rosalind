const newInboundCall = (state, action) => {
  switch (action.type) {
    case 'INBOUND_CALL_POST_SUCCESS':
      return null
    default:
      return state
  }
}

export const form = {
  newInboundCall
}
