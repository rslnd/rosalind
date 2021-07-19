import idx from 'idx'
import moment from 'moment-timezone'
import memoize from 'lodash/memoize'
import { connect } from 'react-redux'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../../i18n'
import { compose } from 'recompose'
import { withTracker } from '../../components/withTracker'
import { dateToDay, daySelector } from '../../../util/time/day'
import { Users } from '../../../api/users'
import { Patients } from '../../../api/patients'
import { Calendars } from '../../../api/calendars'
import { Appointments } from '../../../api/appointments'
import { Schedules } from '../../../api/schedules'
import { AppointmentsScreen } from './AppointmentsScreen'
import { subscribeCache } from '../../../util/meteor/subscribe'
import { hasRole } from '../../../util/meteor/hasRole'
import { Tags } from '../../../api'

const parseDay = memoize(d => moment(d))

const subsCache = subscribeCache(5, 20)

const onNewAppointmentModalOpen = (args) => Appointments.actions.acquireLock.call(args)
const onNewAppointmentModalClose = (args) => Appointments.actions.releaseLock.call(args)

const handleSetAdmitted = (args) => {
  Alert.success(__('appointments.setAdmittedSuccess')) // optimistic for smoother UX
  return Appointments.actions.setAdmitted.callPromise(args)
}

const handleMove = (args) =>
  Appointments.actions.move.callPromise(args).then(() => {
    Alert.success(__('appointments.moveSuccess'))
  }).catch(e => {
    console.error(e)
    if (e.error === 'assigneeNotScheduled') {
      Alert.error(__('appointments.moveErrorAssigneeNotScheduled'))
    } else {
      Alert.error(__('appointments.moveError'))
    }
  })

const composer = (props) => {
  const date = parseDay(idx(props, _ => _.match.params.date))
  const calendarSlug = idx(props, _ => _.match.params.calendar)
  const calendar = Calendars.findOne({ slug: calendarSlug })
  if (!calendar) { return { isLoading: true } }
  const calendarId = calendar._id
  calendar.slotSize = calendar.slotSize || 5

  const day = dateToDay(date)
  const canEditSchedules = hasRole(Meteor.userId(), ['admin', 'schedules-edit'])
  const { dispatch, move } = props

  const appointmentsSub = subsCache.subscribe('appointments-day', { ...day, calendarId })
  const schedulesSub = subsCache.subscribe('schedules-day', { ...day, calendarId })

  // Preload next day in background
  Meteor.defer(() => {
    const nextDay = dateToDay(moment(date).add(1, 'day').toDate())
    subsCache.subscribe('appointments-day', { ...nextDay, calendarId })
    subsCache.subscribe('schedules-day', { ...nextDay, calendarId })
  })

  const selector = {
    calendarId,
    start: {
      $gte: moment(date).startOf('day').toDate(),
      $lte: moment(date).endOf('day').toDate()
    }
  }

  const daySchedule = Schedules.findOne({
    type: 'day',
    calendarId,
    ...daySelector(day)
  })

  let assigneeIds = daySchedule ? (daySchedule.userIds || []) : []

  if (hasRole(Meteor.userId(), ['appointments-column-*'])) {
    assigneeIds = assigneeIds.filter(_id => {
      const assignee = Users.findOne({ _id })
      if (assignee) {
        return hasRole(
          Meteor.userId(),
          ['appointments-column-' + assignee.username]
        )
      }
    })
  }

  if (hasRole(Meteor.userId(), ['appointments-own-only'])) {
    assigneeIds = assigneeIds.filter(_id => Meteor.userId() === _id)
  }

  const assignees = Users.find({ _id: { $in: assigneeIds } }, { sort: { lastName: 1 }, removed: true }).fetch()

  const schedules = Schedules.find({
    type: 'override',
    userId: { $in: assigneeIds },
    ...selector
  }).fetch()

  assigneeIds.push(null)
  const appointmentSelector = { ...selector, assigneeId: { $in: assigneeIds } }

  // Performance: Only render appts when schedules are here to avoid janky ui
  const appointments = schedulesSub.ready()
    ? Appointments.find(appointmentSelector).fetch().map(a => {
      if (!a.patientId) { return a }
      const patient = Patients.findOne({ _id: a.patientId })
      a.patient = patient

      a.tags = Tags.methods.expand(a.tags)
      return a
    })
    : []

  if (calendar.allowUnassigned || appointments.find(a => !a.assigneeId)) {
    if (!calendar.allowUnassigned) {
      console.warn('Found unassigned appointments but calendar disallows unassigned', appointments.filter(a => !a.assigneeId))
    }
    assignees.push(null)
  }

  // When moving between days
  if (move && move.appointment && move.appointment._id && !appointments.find(a => a._id === move.appointment._id)) {
    appointments.push(move.appointment)
  }


  const canEditBookables = hasRole(Meteor.userId(), ['bookables-edit'])
  const canSeeBookables = canEditBookables || hasRole(Meteor.userId(), ['bookables'])

  const isLoading = !appointmentsSub.ready() && appointments.length === 0
  const isReady = !isLoading

  return {
    day,
    daySchedule,
    calendar,
    date,
    appointments,
    assignees,
    schedules,
    onNewAppointmentModalOpen,
    onNewAppointmentModalClose,
    handleSetAdmitted,
    handleMove,
    canEditSchedules,
    canSeeBookables,
    canEditBookables,
    move,
    dispatch,
    isReady
  }
}

const mapStateToProps = (store) => ({
  move: store.appointments.move
})

export const AppointmentsContainer = compose(
  connect(mapStateToProps),
  withTracker(composer)
)(AppointmentsScreen)
