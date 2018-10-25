import moment from 'moment-timezone'
import { publish } from '../../../util/meteor/publish'
import { dayToDate } from '../../../util/time/day'
import { Availabilities } from '../'

export default () => {
  publish({
    name: 'availabilities',
    roles: ['appointments', 'schedules'],
    preload: true,
    fn: function () {
      const startOfYesterday = moment().subtract(1, 'day').startOf('day').toDate()

      return Availabilities.find({
        from: {
          $gte: startOfYesterday
        }
      })
    }
  })

  publish({
    name: 'availabilities-day',
    args: {
      day: Number,
      month: Number,
      year: Number
    },
    roles: ['appointments', 'schedules'],
    preload: true,
    fn: function (day) {
      const date = dayToDate(day)
      const startOfDay = moment(date).startOf('day').toDate()
      const endOfDay = moment(date).endOf('day').toDate()

      return Availabilities.find({
        from: {
          $gte: startOfDay
        },
        to: {
          $lte: endOfDay
        }
      })
    }
  })
}
