import moment from 'moment'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import sortBy from 'lodash/fp/sortBy'
import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import union from 'lodash/union'
import { composeWithTracker } from 'react-komposer'
import { SubsManager } from 'meteor/meteorhacks:subs-manager'
import { dateToDay } from 'util/time/day'
import { Users } from 'api/users'
import { Patients } from 'api/patients'
import { Appointments } from 'api/appointments'
import { Schedules } from 'api/schedules'
import { Loading } from 'client/ui/components/Loading'
import { AppointmentsScreen } from './AppointmentsScreen'

const mapUncapped = map.convert({ cap: false })
const appointmentsSubsManager = new SubsManager({
  cacheLimit: 30,
  expireIn: 15 // in minutes
})

const composer = (props, onData) => {
  const date = moment(props.params && props.params.date || undefined)
  const day = dateToDay(date)
  const startOfDay = date.clone().startOf('day').toDate()
  const endOfDay = date.clone().endOf('day').toDate()

  const dateRange = {
    start: startOfDay,
    end: endOfDay
  }

  const schedulesDaySubscriptions = appointmentsSubsManager.subscribe('schedules', day)
  const schedulesOverrideSubscriptions = appointmentsSubsManager.subscribe('schedules', dateRange)
  const appointmentsSubscription = appointmentsSubsManager.subscribe('appointments', dateRange)

  if (schedulesDaySubscriptions.ready() && schedulesOverrideSubscriptions.ready() && appointmentsSubscription.ready()) {
    const appointmentsSelector = {
      start: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }

    // Fetch all appointments for current day
    const appointments = Appointments.find(appointmentsSelector, { sort: { start: 1 } }).fetch()

    // Combine all assigneeIds from the appointments with
    // the assigneeIds that are scheduled for this day (but may not have any
    // appointments scheduled yet). Make sure the 'null' assignee is added here as well.
    const assigneeIdsScheduled = uniq(flatten(Schedules.find({ day }).fetch().map((s) => s.userIds)))
    const assigneeIdsAppointments = uniq(appointments.map((a) => a.assigneeId))
    const assigneeIds = union(assigneeIdsScheduled, assigneeIdsAppointments, [ null ])

    // Now turn the assigneeIds array into an array of assignee objects
    let assignees = flow(
      mapUncapped((assigneeId) => {
        const user = Users.findOne({ _id: assigneeId })
        return {
          fullNameWithTitle: user && user.fullNameWithTitle(),
          lastName: user && user.profile && user.profile.lastName,
          employee: user && user.profile && user.profile.employee,
          assigneeId
        }
      }),
      sortBy('lastName'),

      // Add override schedules to assignee
      mapUncapped((assignee) => {
        const schedules = Schedules.find({
          userId: assignee.assigneeId,
          start: { $gte: startOfDay },
          end: { $lte: endOfDay }
        }).fetch()

        return {
          ...assignee,
          schedules
        }
      }),

      // Add appointments to assignee
      mapUncapped((assignee) => {
        const selector = {
          ...appointmentsSelector,
          assigneeId: assignee.assigneeId
        }
        const appointments = Appointments.find(selector).fetch().map((appointment) => {
          let patient = Patients.findOne({ _id: appointment.patientId })
          if (patient) {
            patient.prefix = patient.prefix()
          }

          const notes = appointment.notes()
          const lockedBy = Users.findOne({ _id: appointment.lockedBy })
          const lockedByFirstName = lockedBy && lockedBy.firstName()
          return { ...appointment, patient, notes, lockedByFirstName }
        })

        return {
          ...assignee,
          appointments,
          hasAppointments: (appointments.length > 0)
        }
      })
    )(assigneeIds)

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
