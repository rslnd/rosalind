import moment from 'moment-timezone'
import intersectionBy from 'lodash/intersectionBy'
import unionBy from 'lodash/unionBy'
import sortBy from 'lodash/sortBy'
import { withTracker } from 'meteor/react-meteor-data'
import { Loading } from '../../components/Loading'
import { StatusBoard } from './StatusBoard'
import { Schedules } from '../../../api/schedules'
import { Timesheets } from '../../../api/timesheets'
import { Users } from '../../../api/users'
import { Groups } from '../../../api/groups'
import { shortname, fullNameWithTitle } from '../../../api/users/methods/name'
import { subscribe } from '../../../util/meteor/subscribe'

const compose = (props) => {
  if (!subscribe('timesheets-allToday').ready()) { return }

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
        users: sortBy(intersectionBy(scheduledUsers, g.users(), '_id'), (u) => u.lastName).map((user) => {
          const userId = user._id
          const schedule = Schedules.findOne({ type: 'default', 'schedule.day': weekday, userId })
          const isTracking = Timesheets.methods.isTracking({ userId })
          const sum = Timesheets.methods.sum({ userId })

          return {
            user: {
              _id: user._id,
              shortname: shortname(user),
              fullNameWithTitle: fullNameWithTitle(user)
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

    return { defaultSchedules, groups, weekday }
  }

  return update()
}

export const StatusBoardContainer = withTracker(compose)(StatusBoard)
