const newHolidays = (state, action) => {
  switch (action.type) {
    case 'HOLIDAYS_INSERT_SUCCESS':
      return undefined
    default:
      return state
  }
}
const newSchedulesRequest = (state, action) => {
  switch (action.type) {
    case 'SCHEDULES_POST_REQUEST_SUCCESS':
      return undefined
    default:
      return state
  }
}

export const form = {
  newHolidays,
  newSchedulesRequest
}
