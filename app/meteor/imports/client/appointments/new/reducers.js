export const newAppointment = (state = null, action) => {
  switch (action.type) {
    case 'APPOINTMENT_INSERT_SUCCESS':
      return null
    default:
      return state
  }
}
