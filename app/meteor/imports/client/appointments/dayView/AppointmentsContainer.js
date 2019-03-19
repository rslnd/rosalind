import idx from 'idx'
import moment from 'moment-timezone'
import memoize from 'lodash/memoize'
import uniq from 'lodash/uniq'
import { connect } from 'react-redux'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { __ } from '../../../i18n'
import { compose } from 'recompose'
import { withTracker } from '../../components/withTracker'
import { dateToDay } from '../../../util/time/day'
import { Users } from '../../../api/users'
import { Patients } from '../../../api/patients'
import { Calendars } from '../../../api/calendars'
import { Appointments } from '../../../api/appointments'
import { Schedules } from '../../../api/schedules'
import { Constraints } from '../../../api/constraints'
import { Availabilities } from '../../../api/availabilities'
import { AppointmentsScreen } from './AppointmentsScreen'
import { subscribeCache } from '../../../util/meteor/subscribe'

const parseDay = memoize(d => moment(d))

const subsCache = subscribeCache()

const onNewAppointmentModalOpen = (args) => Appointments.actions.acquireLock.call(args)
const onNewAppointmentModalClose = (args) => Appointments.actions.releaseLock.call(args)

const handleSetAdmitted = (args) => {
  Alert.success(__('appointments.setAdmittedSuccess')) // optimistic for smoother UX
  return Appointments.actions.setAdmitted.callPromise(args)
}

const handleMove = (args) =>
  Appointments.actions.move.callPromise(args).then(() => {
    Alert.success(__('appointments.moveSuccess'))
  })

const composer = (props) => {
  const date = parseDay(idx(props, _ => _.match.params.date))
  const calendarSlug = idx(props, _ => _.match.params.calendar)
  const calendar = Calendars.findOne({ slug: calendarSlug })
  if (!calendar) { return { isLoading: true } }
  const calendarId = calendar._id
  calendar.slotSize = calendar.slotSize || 5

  const day = dateToDay(date)
  const canEditSchedules = Roles.userIsInRole(Meteor.userId(), ['admin', 'schedules-edit'])
  const { dispatch, move } = props

  console.log('subbing', { ...day, calendarId })

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

  const schedules = Schedules.find({
    type: 'override',
    ...selector
  }).fetch()

  const assigneeIds = uniq(schedules.map(s => s.userId))
  const assignees = Users.find({ _id: { $in: assigneeIds } }, { sort: { lastName: 1 } }).fetch()

  if (calendar.allowUnassigned) {
    assignees.push(null)
  }

  const appointmentSelector = calendar.allowUnassigned
    ? selector
    : { ...selector, assigneeId: { $ne: null } }

  // Performance: Only render appts when schedules are here to avoid janky ui
  const appointments = schedulesSub.ready()
    ? Appointments.find(appointmentSelector).fetch().map(a => {
      if (!a.patientId) { return a }
      const patient = Patients.findOne({ _id: a.patientId })
      a.patient = patient
      return a
    })
    : []

  const isLoading = !appointmentsSub.ready() && appointments.length === 0
  const isReady = !isLoading

  return {
    day,
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
