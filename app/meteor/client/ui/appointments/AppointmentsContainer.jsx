import moment from 'moment'
import groupBy from 'lodash/groupBy'
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
    start: date.clone().startOf('week').toDate(),
    end: date.clone().add(2, 'weeks').endOf('week').toDate()
  })

  if (appointmentsSubscription.ready()) {
    const selector = {
      start: {
        $gte: date.clone().startOf('day').toDate(),
        $lte: date.clone().endOf('day').toDate()
      }
    }

    const cursor = Appointments.find(selector, { sort: { start: 1 } })

    const appointments = cursor.fetch()
    const appointmentsByAssignee = groupBy(appointments, 'assigneeId')
    const assignees = Object.keys(appointmentsByAssignee).map((assigneeId) => {
      const user = Users.findOne({ _id: assigneeId })
      return {
        assigneeId,
        name: user && user.fullNameWithTitle() || 'Unassigned',
        schedule: '8:00-14:00',
        appointments: appointmentsByAssignee[assigneeId]
      }
    })

    onData(null, { assignees, date })
  } else {
    onData(null, null)
  }
}

export const AppointmentsContainer = composeWithTracker(composer, Loading)(AppointmentsScreen)
