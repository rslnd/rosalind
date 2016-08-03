import moment from 'moment'
import intersectionBy from 'lodash/intersectionBy'
import unionBy from 'lodash/unionBy'
import sortBy from 'lodash/sortBy'
import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { Loading } from 'client/ui/components/Loading'
import { StatusBoard } from './StatusBoard'
import { Schedules } from 'api/schedules'
import { Timesheets } from 'api/timesheets'
import { Users } from 'api/users'
import { Groups } from 'api/groups'

const compose = (props, onData) => {
  if (!Meteor.subscribe('timesheets-allToday').ready()) { return }

  const weekday = moment().locale('en').format('ddd').toLowerCase()
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
        const isTracking = Timesheets.methods.isTracking.call({ userId })
        return [ user, schedule, isTracking ]
      })
    }
  }).filter((g) => g.users.length > 0)

  onData(null, { defaultSchedules, groups, weekday })
}

export const StatusBoardContainer = composeWithTracker(compose, Loading)(StatusBoard)
