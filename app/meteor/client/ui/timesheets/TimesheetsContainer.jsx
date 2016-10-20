import add from 'lodash/sum'
import moment from 'moment'
import 'moment-duration-format'
import { Meteor } from 'meteor/meteor'
import { composeWithTracker } from 'react-komposer'
import { dateToDay } from 'util/time/day'
import { Loading } from 'client/ui/components/Loading'
import { Timesheets } from 'api/timesheets'
import { Schedules } from 'api/schedules'
import { TimesheetsScreen } from './TimesheetsScreen'

const parseDateRange = (dateRange) => {
  const date = dateRange ? moment(dateRange, 'YYYY-MM-DD') : moment()
  return {
    start: date.clone().startOf('month'),
    end: date.clone().endOf('month')
  }
}

let userIdStore = new ReactiveVar()

const composer = (props, onData) => {
  const { start, end } = parseDateRange(props.params.dateRange)
  const userId = userIdStore.get() || Meteor.userId()
  const subscription = Meteor.subscribe('timesheets-range', {
    userId,
    start: start.toDate(),
    end: end.toDate()
  })

  const onChangeUserId = (newUserId) => {
    userIdStore.set(newUserId)
  }

  if (subscription.ready()) {
    const update = () => {
      const timesheets = Timesheets.find({
        userId,
        start: { $gt: start.toDate() }
      }, {
        sort: { start: -1 }
      }).fetch()
      const isTracking = Timesheets.methods.isTracking({ userId })

      const days = timesheets.map((timesheet) => {
        const day = dateToDay(timesheet.start)
        const scheduledHours = Schedules.methods.getScheduledHours({ userId, day })
        console.log(day, userId, scheduledHours)
        return {
          day,
          timesheet,
          scheduledHours
        }
      }).filter((s) => s.scheduledHours)

      const sum = add(days.map((d) => d.timesheet.duration()))

      onData(null, { days, timesheets, isTracking, sum, start, end, userId, onChangeUserId })
    }

    update()

    // FIXME: This makes the screen flash
    // const tick = setInterval(update, 1000)
    // const cleanup = () => clearInterval(tick)
    // return cleanup
  }
}

export const TimesheetsContainer = composeWithTracker(composer, Loading)(TimesheetsScreen)
