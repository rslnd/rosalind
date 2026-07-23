export const newAppointment = (state = {}, action) => {
  switch (action.type) {
    case 'PATIENT_CHANGE_VALUE':
      // Reset patient fields (to clear stale data of a previously typed patient),
      // but keep the rest of the form (registeredFields, fields and the appointment
      // section) so tags/note selected before picking a patient are not lost.
      return {
        ...state,
        values: {
          ...(state.values || {}),
          patient: undefined
        }
      }
    case 'APPOINTMENT_INSERT_SUCCESS':
      return {}
    default:
      return state
  }
}
