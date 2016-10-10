import moment from 'moment'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import { composeWithTracker } from 'react-komposer'
import { SubsManager } from 'meteor/meteorhacks:subs-manager'
import { Users } from 'api/users'
import { Patients } from 'api/patients'
import { Appointments } from 'api/appointments'
import { Schedules } from 'api/schedules'
import { Loading } from 'client/ui/components/Loading'
import { AppointmentsScreen } from './AppointmentsScreen'

const appointmentsSubsManager = new SubsManager({
  cacheLimit: 30,
  expireIn: 15 // in minutes
})

const composer = (props, onData) => {
  const date = moment(props.params && props.params.date || undefined)
  const dateRange = {
    start: date.clone().startOf('day').toDate(),
    end: date.clone().endOf('day').toDate()
  }

  const schedulesSubscriptions = appointmentsSubsManager.subscribe('schedules', dateRange)
  const appointmentsSubscription = appointmentsSubsManager.subscribe('appointments', dateRange)

  if (schedulesSubscriptions.ready() && appointmentsSubscription.ready()) {
    const appointmentsSelector = {
      start: {
        $gte: date.clone().startOf('day').toDate(),
        $lte: date.clone().endOf('day').toDate()
      }
    }

    const mapUncapped = map.convert({ cap: false })
    let assignees = flow(
      groupBy('assigneeId'),
      mapUncapped((appointments, assigneeId) => {
        const user = Users.findOne({ _id: assigneeId })
        return {
          fullNameWithTitle: user && user.fullNameWithTitle(),
          lastName: user && user.profile.lastName,
          schedule: '8:00-14:00',
          assigneeId,
          schedules: Schedules.find({ userId: assigneeId }).fetch(),
          appointments: appointments.map((appointment) => {
            let patient = Patients.findOne({ _id: appointment.patientId })
            if (patient) {
              patient.prefix = patient.prefix()
            }

            const notes = appointment.notes()
            const lockedBy = Users.findOne({ _id: appointment.lockedBy })
            const lockedByFirstName = lockedBy && lockedBy.firstName()
            return { ...appointment, patient, notes, lockedByFirstName }
          })
        }
      }),
      sortBy('lastName')
    )(Appointments.find(appointmentsSelector, { sort: { start: 1 } }).fetch())

    if (assignees.length === 0) {
      assignees.push({ assigneeId: null, appointments: [] })
    }

    const onPopoverOpen = (args) => Appointments.actions.acquireLock.call(args)
    const onPopoverClose = (args) => Appointments.actions.releaseLock.call(args)

    onData(null, { assignees, date, onPopoverOpen, onPopoverClose })
  } else {
    onData(null, null)
  }

  // Cleanup
  return () => Appointments.actions.releaseLock.call({})
}

export const AppointmentsContainer = composeWithTracker(composer, Loading)(AppointmentsScreen)
