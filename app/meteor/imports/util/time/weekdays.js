import moment from 'moment-timezone'

export const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const toWeekday = date =>
  moment.tz(date, 'Europe/Vienna').clone().locale('en').format('ddd').toLowerCase()
