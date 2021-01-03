const initialState = {
  isMoving: false,
  appointment: {},
  patient: {},
  moveAppointmentId: null,
  moveToAssigneeId: null,
  moveToStart: null
}

export const move = (state = initialState, action) => {
  switch (action.type) {
    case 'APPOINTMENT_MOVE_START':
      return {
        ...state,
        isMoving: true,
        moveAppointmentId: action.appointment._id,
        appointment: action.appointment,
        patient: action.patient,
        allowMoveBetweenAssignees: action.allowMoveBetweenAssignees
      }

    case 'APPOINTMENT_MOVE_HOVER':
      return {
        ...state,
        moveToStart: action.start,
        moveToEnd: action.end,
        moveToAssigneeId:
          state.allowMoveBetweenAssignees
            ? action.assigneeId
            : (state.appointment.assigneeId || action.assigneeId)
      }

    case 'APPOINTMENT_MOVE_END':
      return {
        ...initialState
      }

    default:
      return state
  }
}
