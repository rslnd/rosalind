import add from 'lodash/sum'
import moment from 'moment-timezone'
import 'moment-duration-format'
import { Meteor } from 'meteor/meteor'
import { ReactiveVar } from 'meteor/reactive-var'
import { withTracker } from '../components/withTracker'
import { dateToDay } from '../../util/time/day'
import { Timesheets } from '../../api/timesheets'
import { duration } from '../../api/timesheets/methods/sum'
import { Schedules } from '../../api/schedules'
import { TimesheetsScreen } from './TimesheetsScreen'
import { subscribe } from '../../util/meteor/subscribe'

const parseDateRange = (dateRange) => {
  const date = dateRange ? moment(dateRange, 'YYYY-MM-DD') : moment()
  return {
    start: date.clone().startOf('month'),
    end: date.clone().endOf('month')
  }
}

let userIdStore = new ReactiveVar()

const composer = (props) => {
  const { start, end } = parseDateRange(props.match && props.match.params.dateRange)
  const userId = userIdStore.get() || Meteor.userId()
  subscribe('timesheets-range', {
    userId,
    start: start.toDate(),
    end: end.toDate()
  })

  const onChangeUserId = (newUserId) => {
    userIdStore.set(newUserId)
  }

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

  const sum = add(days.map(duration))

  return { days, timesheets, isTracking, sum, start, end, userId, onChangeUserId }
}

export const TimesheetsContainer = withTracker(composer)(TimesheetsScreen)
