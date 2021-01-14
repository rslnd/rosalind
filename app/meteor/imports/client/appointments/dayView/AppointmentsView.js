import moment from 'moment-timezone'
import React from 'react'
import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { Schedules } from '../../../api/schedules'
import { AppointmentModalContainer } from '../info/AppointmentModalContainer'
import { HeaderRowContainer } from './header/HeaderRowContainer'
import { AppointmentsGrid } from './grid/AppointmentsGrid'
import { ScheduleModal } from './schedules/ScheduleModal'
import { NewAppointmentModal } from './new/NewAppointmentModal'
import { WaitlistAssigneeModal } from './WaitlistAssigneeModal'
import { setTime } from './grid/timeSlots'
import { ErrorBoundary } from '../../layout/ErrorBoundary'
import { PatientsAppointmentsContainer } from '../../patientAppointments/PatientsAppointmentsContainer'
import { RemovedAppointments } from './RemovedAppointments'
import { hasRole } from '../../../util/meteor/hasRole'

export class AppointmentsView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedStart: null,
      selectedAssigneeId: null,
      newAppointmentModalOpen: false,
      appointmentModalOpen: false,
      selectedAppointmentId: null,
      override: {
        isOverriding: false,
        overrideAssigneeId: null,
        start: null,
        end: null
      }
    }

    this.handleAppointmentClick = this.handleAppointmentClick.bind(this)
    this.handleAppointmentModalOpen = this.handleAppointmentModalOpen.bind(this)
    this.handleAppointmentModalClose = this.handleAppointmentModalClose.bind(this)
    this.handleNewAppointmentModalOpen = this.handleNewAppointmentModalOpen.bind(this)
    this.handleNewAppointmentModalClose = this.handleNewAppointmentModalClose.bind(this)
    this.handleToggleOverrideMode = this.handleToggleOverrideMode.bind(this)
    this.handleOverrideStart = this.handleOverrideStart.bind(this)
    this.handleOverrideEnd = this.handleOverrideEnd.bind(this)
    this.handleOverrideStartOrEnd = this.handleOverrideStartOrEnd.bind(this)
    this.handleBlankClick = this.handleBlankClick.bind(this)
    this.handleBlankHover = this.handleBlankHover.bind(this)
    this.handleOverrideHover = this.handleOverrideHover.bind(this)
    this.handleScheduleModalOpen = this.handleScheduleModalOpen.bind(this)
    this.handleScheduleModalClose = this.handleScheduleModalClose.bind(this)
    this.handleScheduleSoftRemove = this.handleScheduleSoftRemove.bind(this)
    this.handleSetAdmitted = this.handleSetAdmitted.bind(this)
    this.handleSelectWaitlistAssigneeModalClose = this.handleSelectWaitlistAssigneeModalClose.bind(this)
    this.handleMoveStart = this.handleMoveStart.bind(this)
    this.handleMoveHover = this.handleMoveHover.bind(this)
    this.handleMoveEnd = this.handleMoveEnd.bind(this)
  }

  handleAppointmentClick (event, appointment) {
    if (this.props.move.isMoving) {
      return this.handleMoveEnd()
    }

    // TODO: Per-calendar flag
    // if (event.type === 'contextmenu' && moment().isSame(appointment.start, 'day')) {
    //   event.preventDefault()
    //   return this.handleSetAdmitted(appointment)
    // }

    this.handleAppointmentModalOpen(appointment)
  }

  handleAppointmentModalOpen (appointment) {
    this.setState({ appointmentModalOpen: true, selectedAppointmentId: appointment._id })
  }

  handleAppointmentModalClose () {
    this.setState({ appointmentModalOpen: false })
  }

  handleBlankClick (options) {
    if (this.state.override.isOverriding) {
      this.handleOverrideStartOrEnd(options)
    } else if (this.props.move.isMoving) {
      this.handleMoveEnd(options)
    } else {
      this.handleNewAppointmentModalOpen(options)
    }
  }

  handleBlankHover (options) {
    if (this.state.override.isOverriding) {
      this.handleOverrideHover(options)
    } else if (this.props.move.isMoving) {
      this.handleMoveHover(options)
    }
  }

  handleNewAppointmentModalClose () {
    this.props.onNewAppointmentModalClose({
      calendarId: this.props.calendar._id,
      start: this.state.selectedStart,
      assigneeId: this.state.selectedAssigneeId
    })

    this.setState({ newAppointmentModalOpen: false })
  }

  handleNewAppointmentModalOpen ({ event, start, end, assigneeId }) {
    event.preventDefault()

    this.props.onNewAppointmentModalOpen({
      calendarId: this.props.calendar._id,
      start,
      end,
      assigneeId
    })

    this.setState({
      newAppointmentModalOpen: true,
      selectedStart: start,
      selectedEnd: end,
      selectedAssigneeId: assigneeId
    })
  }

  selectedDateTime () {
    return setTime(this.state.selectedStart)(moment(this.props.date))
  }

  handleToggleOverrideMode ({ assigneeId }) {
    this.setState({
      override: {
        isOverriding: !this.state.override.isOverriding,
        overrideAssigneeId: assigneeId
      }
    })
  }

  handleOverrideStart ({ start }) {
    if (this.state.override.isOverriding) {
      this.setState({
        override: {
          ...this.state.override,
          start: start,
          end: start
        }
      })
    }
  }

  handleOverrideHover ({ end }) {
    this.setState({
      override: {
        ...this.state.override,
        end: moment(end).toDate()
      }
    })
  }

  handleOverrideEnd ({ end }) {
    if (this.state.override.isOverriding) {
      let start = this.state.override.start

      if (this.state.override.start > this.state.override.end) {
        [ start, end ] = [ end, start ]
      }

      const newSchedule = {
        userId: this.state.override.overrideAssigneeId,
        calendarId: this.props.calendar._id,
        start,
        end,
        available: false,
        type: 'override'
      }

      console.log('[Appointments] Schedules override end event', { newSchedule })

      Schedules.actions.insert.callPromise({ schedule: newSchedule }).then(() => {
        this.setState({
          override: {
            isOverriding: false,
            start: null,
            end: null,
            overrideAssigneeId: null
          }
        })
      })
    }
  }

  handleOverrideStartOrEnd ({ start, end, assigneeId }) {
    if (this.state.override.start) {
      this.handleOverrideEnd({ start, end, assigneeId })
    } else {
      this.handleOverrideStart({ start, end, assigneeId })
    }
  }

  handleScheduleModalOpen ({ scheduleId }) {
    if (this.props.canEditSchedules) {
      this.setState({
        scheduleModalOpen: true,
        scheduleModalId: scheduleId
      })
    }
  }

  handleScheduleModalClose () {
    this.setState({
      scheduleModalOpen: false,
      scheduleModalId: null
    })
  }

  handleScheduleSoftRemove () {
    if (this.state.scheduleModalOpen && this.state.scheduleModalId) {
      Schedules.actions.softRemove.callPromise({ scheduleId: this.state.scheduleModalId }).then(() => {
        this.handleScheduleModalClose()
        Alert.success(__('schedules.softRemoveSuccess'))
      })
    }
  }

  handleSetAdmitted (appointment) {
    if (appointment.assigneeId && !hasRole(appointment.assigneeId, ['promptWaitlistAssigneeId'])) {
      this.props.onSetAdmitted({ appointmentId: appointment._id })
    } else {
      // prompt if there is more than one one assignee today
      const otherAssignees = this.props.assignees.filter(a => a && a._id)
      const calendar = this.props.calendar

      if (!(calendar && calendar.allowAdmittingUnassignedToAnyone) && otherAssignees.length === 1) {
        this.props.onSetAdmitted({
          appointmentId: appointment._id,
          waitlistAssigneeId: otherAssignees[0]._id
        })
      } else {
        this.setState({
          selectWaitlistAssigneeModalOpen: true,
          selectWaitlistAssigneeAppointmentId: appointment._id
        })
      }
    }
  }

  handleSelectWaitlistAssigneeModalClose () {
    this.setState({
      selectWaitlistAssigneeModalOpen: false
    })
  }

  handleMoveStart (args) {
    this.setState({
      appointmentModalOpen: false
    })

    this.props.dispatch({
      type: 'APPOINTMENT_MOVE_START',
      ...args
    })
  }

  handleMoveHover ({ assigneeId, start, end }) {
    this.props.dispatch({
      type: 'APPOINTMENT_MOVE_HOVER',
      assigneeId,
      start,
      end
    })
  }

  handleMoveEnd () {
    const { moveAppointmentId, moveToStart, moveToEnd, moveToAssigneeId } = this.props.move

    if (moveAppointmentId && moveToStart && moveToAssigneeId !== undefined) {
      this.props.onMove({
        appointmentId: moveAppointmentId,
        newStart: moveToStart,
        newEnd: moveToEnd,
        newAssigneeId: moveToAssigneeId
      }).then(() => {
        this.props.dispatch({
          type: 'APPOINTMENT_MOVE_END'
        })
      })
    }
  }

  render () {
    if (!this.props.calendar) {
      return null
    }

    return (
      <div>
        <ErrorBoundary>
          <HeaderRowContainer
            date={this.props.date}
            daySchedule={this.props.daySchedule}
            calendar={this.props.calendar}
            assignees={this.props.assignees}
            onToggleOverrideMode={this.handleToggleOverrideMode}
            overrideMode={this.state.override.isOverriding} />
        </ErrorBoundary>

        <ErrorBoundary>
          <AppointmentsGrid
            calendar={this.props.calendar}
            date={this.props.date}
            assignees={this.props.assignees}
            appointments={this.props.appointments}
            availabilities={this.props.availabilities}
            schedules={this.props.schedules}
            onAppointmentClick={this.handleAppointmentClick}
            onBlankClick={this.handleBlankClick}
            onBlankMouseEnter={this.handleBlankHover}
            override={this.state.override}
            onScheduleModalOpen={this.handleScheduleModalOpen}
            move={this.props.move} />
        </ErrorBoundary>

        <ErrorBoundary>
          {
            window.location.hash.indexOf('old') !== -1
              ? <AppointmentModalContainer
                appointmentId={this.state.selectedAppointmentId}
                onMoveStart={this.handleMoveStart}
                onSetAdmitted={this.handleSetAdmitted}
                show={this.state.appointmentModalOpen}
                onClose={this.handleAppointmentModalClose} />
              : <PatientsAppointmentsContainer
                appointmentId={this.state.selectedAppointmentId}
                onMoveStart={this.handleMoveStart}
                onSetAdmitted={this.handleSetAdmitted}
                show={this.state.appointmentModalOpen}
                onClose={this.handleAppointmentModalClose} />
          }
        </ErrorBoundary>

        <ErrorBoundary>
          <ScheduleModal
            show={this.state.scheduleModalOpen}
            onClose={this.handleScheduleModalClose}
            onClickScheduleSoftRemove={this.handleScheduleSoftRemove} />
        </ErrorBoundary>

        <ErrorBoundary>
          <NewAppointmentModal
            calendar={this.props.calendar}
            open={this.state.newAppointmentModalOpen}
            assigneeId={this.state.selectedAssigneeId}
            start={this.state.selectedStart}
            end={this.state.selectedEnd}
            onClose={this.handleNewAppointmentModalClose} />
        </ErrorBoundary>

        <ErrorBoundary>
          <WaitlistAssigneeModal
            assignees={
              (this.props.calendar && this.props.calendar.allowAdmittingUnassignedToAnyone)
                ? null // allow all assignees
                : this.props.assignees // only those available today
            }
            show={this.state.selectWaitlistAssigneeModalOpen}
            onClose={this.handleSelectWaitlistAssigneeModalClose}
            appointmentId={this.state.selectWaitlistAssigneeAppointmentId}
            onSetAdmitted={this.props.onSetAdmitted}

          />
        </ErrorBoundary>

        <ErrorBoundary>
          <div style={marginTopStyle}>
            <RemovedAppointments
              calendarId={this.props.calendar._id}
              date={this.props.date}
            />
          </div>
        </ErrorBoundary>
      </div>
    )
  }
}

const marginTopStyle = {
  marginTop: 60
}
