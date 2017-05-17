const initialState = {
  isMoving: false,
  moveAppointmentId: null,
  moveToAssigneeId: null,
  moveToTime: null
}

export const move = (state = initialState, action) => {
  switch (action.type) {
    case 'APPOINTMENT_MOVE_START':
      return {
        ...state,
        isMoving: true,
        moveAppointmentId: action.appointment._id
      }

    case 'APPOINTMENT_MOVE_HOVER':
      return {
        ...state,
        moveToAssigneeId: action.assigneeId,
        moveToTime: action.time
      }

    case 'APPOINTMENT_MOVE_END':
      return {
        ...initialState
      }

    default:
      return state
  }
}
