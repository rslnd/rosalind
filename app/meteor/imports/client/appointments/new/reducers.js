export const newAppointment = (state = {}, action) => {
  switch (action.type) {
    case 'APPOINTMENT_INSERT_SUCCESS':
      return {}
    default:
      return state
  }
}
