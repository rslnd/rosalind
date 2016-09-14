import moment from 'moment'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import { composeWithTracker } from 'react-komposer'
import { SubsManager } from 'meteor/meteorhacks:subs-manager'
import { Users } from 'api/users'
import { Appointments } from 'api/appointments'
import { Loading } from 'client/ui/components/Loading'
import { AppointmentsScreen } from './AppointmentsScreen'

const appointmentsSubsManager = new SubsManager({
  cacheLimit: 30,
  expireIn: 15 // in minutes
})

const composer = (props, onData) => {
  const date = moment(props.params && props.params.date || undefined)

  const appointmentsSubscription = appointmentsSubsManager.subscribe('appointments', {
    start: date.clone().startOf('day').toDate(),
    end: date.clone().endOf('day').toDate()
  })

  if (appointmentsSubscription.ready()) {
    const appointmentsSelector = {
      start: {
        $gte: date.clone().startOf('day').toDate(),
        $lte: date.clone().endOf('day').toDate()
      }
    }

    const mapUncapped = map.convert({ cap: false })
    const assignees = flow(
      groupBy('assigneeId'),
      mapUncapped((appointments, assigneeId) => {
        const user = Users.findOne({ _id: assigneeId })
        return {
          fullNameWithTitle: user && user.fullNameWithTitle() || 'Unassigned',
          lastName: user && user.profile.lastName,
          schedule: '8:00-14:00',
          assigneeId,
          appointments
        }
      }),
      sortBy('lastName')
    )(Appointments.find(appointmentsSelector, { sort: { start: 1 } }).fetch())

    onData(null, { assignees, date })
  } else {
    onData(null, null)
  }
}

export const AppointmentsContainer = composeWithTracker(composer, Loading)(AppointmentsScreen)
