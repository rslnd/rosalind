import faker from 'faker'
import moment from 'moment'

const start = (day) => faker.date.between(
  day.clone().hour(7).minute(0).toDate(),
  day.clone().hour(11).minute(30).toDate()
)

const end = (day) => faker.date.between(
  day.clone().hour(12).minute(30).toDate(),
  day.clone().hour(21).minute(0).toDate()
)

const timesheetForDay = (day) => {
  return {
    start: start(day),
    end: end(day),
    tracking: false
  }
}

const timesheetForToday = () => {
  return {
    start: start(moment()),
    tracking: true
  }
}

export const timesheets = (Timesheets, userIds) => {
  userIds.forEach((userId) => {
    for (let i = 1; i < 30; i++) {
      const day = moment().subtract(i, 'days')

      if (day.day() !== 0 && Math.random() < 0.7) {
        Timesheets.insert({ ...timesheetForDay(day), userId })
      }
    }

    if (moment().day() !== 0 && Math.random() < 0.9) {
      Timesheets.insert({ ...timesheetForToday(), userId })
    }
  })
}
