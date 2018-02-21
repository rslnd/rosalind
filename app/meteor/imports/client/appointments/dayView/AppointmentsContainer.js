import idx from 'idx'
import moment from 'moment-timezone'
import memoize from 'lodash/memoize'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import sortBy from 'lodash/fp/sortBy'
import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import union from 'lodash/union'
import { connect } from 'react-redux'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { TAPi18n } from 'meteor/tap:i18n'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { SubsManager } from 'meteor/meteorhacks:subs-manager'
import { dateToDay } from '../../../util/time/day'
import { Users } from '../../../api/users'
import { Patients } from '../../../api/patients'
import { Calendars } from '../../../api/calendars'
import { Appointments } from '../../../api/appointments'
import { Schedules } from '../../../api/schedules'
import { Loading } from '../../components/Loading'
import { AppointmentsScreen } from './AppointmentsScreen'

const mapUncapped = map.convert({ cap: false })
const appointmentsSubsManager = new SubsManager({
  cacheLimit: 30,
  expireIn: 15 // in minutes
})

const parseDay = memoize(d => moment(d))

const composer = (props, onData) => {
  const date = parseDay(idx(props, _ => _.match.params.date))
  const calendarSlug = idx(props, _ => _.match.params.calendar)
  const calendar = Calendars.findOne({ slug: calendarSlug })
  if (!calendar) { return }

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
    const appointmentsSubscription = appointmentsSubsManager.subscribe('appointments-legacy', dateRange)
    subsReady = schedulesDaySubscriptions.ready() && schedulesOverrideSubscriptions.ready() && appointmentsSubscription.ready()
  } else {
    subsReady = true
  }

  if (subsReady) {
    const appointmentsSelector = {
      calendarId: calendar._id,
      start: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }

    // Fetch all appointments for current day
    const appointments = Appointments.find(appointmentsSelector, { sort: { start: 1 } }).fetch()

    // Combine all assigneeIds from the appointments with
    // the assigneeIds that are scheduled for this day (but may not have any
    // appointments scheduled yet)
    const assigneeIdsScheduled = uniq(flatten(Schedules.find({
      day,
      calendarId: calendar._id
    }).fetch().map((s) => s.userIds)))
    const assigneeIdsAppointments = uniq(appointments.map((a) => a.assigneeId))

    // HACK: Merge undefined to null
    const assigneeIdsNullOrUndefined = union(assigneeIdsScheduled, assigneeIdsAppointments)
    const assigneeIdsFiltered = assigneeIdsNullOrUndefined.filter((id) => id !== undefined)

    // If calendar allows unassigned appointments, add null assignee if not already present
    const addNullAssignee = a =>
      (a.indexOf(null) === -1)
      ? [...a, null]
      : a

    let assigneeIds = calendar.allowUnassigned
      ? addNullAssignee(assigneeIdsFiltered)
      : assigneeIdsFiltered

    // Now turn the assigneeIds array into an array of assignee objects
    let assignees = flow(
      mapUncapped((assigneeId) => {
        const user = Users.findOne({ _id: assigneeId })
        return {
          fullNameWithTitle: user && Users.methods.fullNameWithTitle(user),
          lastName: user && user.lastName,
          employee: user && user.employee,
          assigneeId: assigneeId || null
        }
      }),
      sortBy('lastName'),

      // Add override schedules to assignee
      mapUncapped((assignee) => {
        const overrides = Schedules.find({
          type: 'override',
          calendarId: calendar._id,
          userId: assignee.assigneeId,
          start: { $gte: startOfDay },
          end: { $lte: endOfDay }
        }).fetch()

        const constraints = Schedules.find({
          type: 'constraint',
          calendarId: calendar._id,
          userId: assignee.assigneeId,
          weekdays: date.clone().locale('en').format('ddd').toLowerCase(),
          start: { $lte: endOfDay },
          end: { $gte: startOfDay }
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
            patient.prefix = Patients.methods.prefix(patient)
          }

          const notes = appointment.notes()
          const lockedBy = Users.findOne({ _id: appointment.lockedBy })
          const lockedByFirstName = lockedBy && Users.methods.firstName(lockedBy)
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

    const canEditSchedules = Roles.userIsInRole(Meteor.userId(), ['admin', 'schedules-edit'])

    const onNewAppointmentModalOpen = (args) => Appointments.actions.acquireLock.call(args)
    const onNewAppointmentModalClose = (args) => Appointments.actions.releaseLock.call(args)
    const handleSetAdmitted = (args) => {
      Alert.success(TAPi18n.__('appointments.setAdmittedSuccess')) // optimistic for smoother UX
      return Appointments.actions.setAdmitted.callPromise(args)
    }

    const handleMove = (args) =>
      Appointments.actions.move.callPromise(args).then(() => {
        Alert.success(TAPi18n.__('appointments.moveSuccess'))
      })

    const { dispatch, move } = props

    onData(null, {
      calendar,
      assignees,
      date,
      onNewAppointmentModalOpen,
      onNewAppointmentModalClose,
      handleSetAdmitted,
      handleMove,
      subsReady,
      canEditSchedules,
      move,
      dispatch
    })
  } else {
    onData(null, null)
  }

  // Cleanup
  return () => Appointments.actions.releaseLock.call({})
}

export const AppointmentsContainerComposed = composeWithTracker(composer, Loading)(AppointmentsScreen)

const mapStateToProps = (store) => ({
  move: store.appointments.move
})

export const AppointmentsContainer = connect(mapStateToProps)(AppointmentsContainerComposed)
