import moment from 'moment'
import intersectionBy from 'lodash/intersectionBy'
import unionBy from 'lodash/unionBy'
import sortBy from 'lodash/sortBy'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Loading } from 'client/ui/components/Loading'
import { StatusBoard } from './StatusBoard'
import { Schedules } from 'api/schedules'
import { Timesheets } from 'api/timesheets'
import { Users } from 'api/users'
import { Groups } from 'api/groups'

const compose = (props, onData) => {
  if (!Meteor.subscribe('timesheets-allToday').ready()) { return }

  const update = () => {
    // HACK: See schedules from monday if today's a sunday
    let viewDay = moment()
    if (moment().day() === 0) {
      viewDay = moment().add(1, 'day')
    }
    const weekday = viewDay.locale('en').format('ddd').toLowerCase()
    const defaultSchedules = Schedules.find({ type: 'default', 'schedule.day': weekday }).fetch()

    const defaultScheduledUsers = defaultSchedules.map((s) => {
      return Users.findOne(s.userId)
    })

    const scheduledUsers = unionBy(defaultScheduledUsers, '_id')

    const groups = Groups.methods.all().map((g) => {
      return {
        group: g,
        users: sortBy(intersectionBy(scheduledUsers, g.users(), '_id'), (u) => u.profile.lastName).map((user) => {
          const userId = user._id
          const schedule = Schedules.findOne({ type: 'default', 'schedule.day': weekday, userId })
          const isTracking = Timesheets.methods.isTracking({ userId })
          const sum = Timesheets.methods.sum({ userId })

          return {
            user: {
              _id: user._id,
              shortname: user.shortname(),
              fullNameWithTitle: user.fullNameWithTitle()
            },
            timesheets: {
              sum,
              sumFormatted: moment.duration(sum).format('H[h] mm[m]'),
              stringified: Timesheets.methods.stringify({ userId }),
              isTracking
            },
            schedule: {
              sum: parseFloat(schedule.totalHoursPerDay(weekday).toFixed(1)),
              stringified: schedule.stringify(weekday)
            }
          }
        })
      }
    }).filter((g) => g.users.length > 0)

    onData(null, { defaultSchedules, groups, weekday })
  }

  update()
  const tick = setInterval(update, 15 * 1000)
  const cleanup = () => clearInterval(tick)
  return cleanup
}

export const StatusBoardContainer = composeWithTracker(compose, Loading)(StatusBoard)
