import moment from 'moment'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import sortBy from 'lodash/fp/sortBy'
import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import union from 'lodash/union'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
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

  // Appointments and schedules for future dates are cached as global subscriptions
  let subsReady = false
  if (date.toDate() < moment().startOf('day').toDate()) {
    const schedulesDaySubscriptions = appointmentsSubsManager.subscribe('schedules', day)
    const schedulesOverrideSubscriptions = appointmentsSubsManager.subscribe('schedules', dateRange)
    const appointmentsSubscription = appointmentsSubsManager.subscribe('appointments', dateRange)
    appointmentsSubsManager.subscribe('schedules-constraints')
    subsReady = schedulesDaySubscriptions.ready() && schedulesOverrideSubscriptions.ready() && appointmentsSubscription.ready()
  } else {
    subsReady = true
  }

  if (subsReady) {
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

    // HACK: Merge undefined to null
    const assigneeIdsNullOrUndefined = union(assigneeIdsScheduled, assigneeIdsAppointments, [ null ])
    const assigneeIds = assigneeIdsNullOrUndefined.filter((id) => id !== undefined)

    // Now turn the assigneeIds array into an array of assignee objects
    let assignees = flow(
      mapUncapped((assigneeId) => {
        const user = Users.findOne({ _id: assigneeId })
        return {
          fullNameWithTitle: user && user.fullNameWithTitle(),
          lastName: user && user.profile && user.profile.lastName,
          employee: user && user.profile && user.profile.employee,
          assigneeId: assigneeId || null
        }
      }),
      sortBy('lastName'),

      // Add override schedules to assignee
      mapUncapped((assignee) => {
        const overrides = Schedules.find({
          type: 'override',
          userId: assignee.assigneeId,
          start: { $gte: startOfDay },
          end: { $lte: endOfDay }
        }).fetch()

        const constraints = Schedules.find({
          type: 'constraint',
          userId: assignee.assigneeId,
          start: { $lte: startOfDay },
          end: { $gte: endOfDay }
        }).fetch()

        return {
          ...assignee,
          schedules: overrides,
          constraints
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
          return {
            ...appointment,
            patient,
            notes,
            lockedByFirstName,
            timeStart: moment(appointment.start).format('[T]HHmm'),
            timeEnd: moment(appointment.end).format('[T]HHmm')
          }
        })

        return {
          ...assignee,
          appointments,
          hasAppointments: (appointments.length > 0)
        }
      })
    )(assigneeIds)

    const onNewAppointmentPopoverOpen = (args) => Appointments.actions.acquireLock.call(args)
    const onNewAppointmentPopoverClose = (args) => Appointments.actions.releaseLock.call(args)
    const handleSetAdmitted = (args) => Appointments.actions.setAdmitted.call(args)
    const handleMove = (args) => Appointments.actions.move.callPromise(args).then(() => {
      Alert.success(TAPi18n.__('appointments.moveSuccess'))
    })

    onData(null, { assignees, date, onNewAppointmentPopoverOpen, onNewAppointmentPopoverClose, handleSetAdmitted, handleMove, subsReady })
  } else {
    onData(null, null)
  }

  // Cleanup
  return () => Appointments.actions.releaseLock.call({})
}

export const AppointmentsContainer = composeWithTracker(composer, Loading)(AppointmentsScreen)
