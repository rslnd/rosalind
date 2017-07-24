import moment from 'moment-timezone'
import React from 'react'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { Schedules } from '../../../api/schedules'
import { AppointmentInfoModal } from '../info/AppointmentInfoModal'
import { HeaderRowContainer } from './header/HeaderRowContainer'
import { AppointmentsGrid } from './grid/AppointmentsGrid'
import { ScheduleModal } from './schedules/ScheduleModal'
import { NewAppointmentPopover } from './new/NewAppointmentPopover'
import { setTime } from './grid/timeSlots'

export class AppointmentsView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedTime: null,
      selectedAssigneeId: null,
      popoverOpen: false,
      popoverAnchor: null,
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
    this.handleNewAppointmentPopoverOpen = this.handleNewAppointmentPopoverOpen.bind(this)
    this.handleNewAppointmentPopoverClose = this.handleNewAppointmentPopoverClose.bind(this)
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
    this.handleMoveStart = this.handleMoveStart.bind(this)
    this.handleMoveHover = this.handleMoveHover.bind(this)
    this.handleMoveEnd = this.handleMoveEnd.bind(this)
  }

  handleAppointmentClick (event, appointment) {
    if (this.props.move.isMoving) {
      return this.handleMoveEnd()
    }

    if (event.type === 'contextmenu') {
      event.preventDefault()
      this.handleSetAdmitted(appointment)
    } else {
      this.handleAppointmentModalOpen(appointment)
    }
  }

  handleAppointmentModalOpen (appointment) {
    this.setState({ ...this.state, appointmentModalOpen: true, selectedAppointmentId: appointment._id })
  }

  handleAppointmentModalClose () {
    this.setState({ ...this.state, appointmentModalOpen: false })
  }

  handleBlankClick (options) {
    if (this.state.override.isOverriding) {
      this.handleOverrideStartOrEnd(options)
    } else if (this.props.move.isMoving) {
      this.handleMoveEnd(options)
    } else {
      this.handleNewAppointmentPopoverOpen(options)
    }
  }

  handleBlankHover (options) {
    if (this.state.override.isOverriding) {
      this.handleOverrideHover(options)
    } else if (this.props.move.isMoving) {
      this.handleMoveHover(options)
    }
  }

  handleNewAppointmentPopoverClose () {
    if (this.props.onNewAppointmentPopoverClose) {
      this.props.onNewAppointmentPopoverClose({
        time: this.state.selectedTime,
        assigneeId: this.state.selectedAssigneeId
      })
    }

    this.setState({ ...this.state, popoverOpen: false })
  }

  handleNewAppointmentPopoverOpen ({ event, time, assigneeId }) {
    event.preventDefault()

    if (this.props.onNewAppointmentPopoverOpen) {
      this.props.onNewAppointmentPopoverOpen({ time, assigneeId })
    }

    this.setState({ ...this.state,
      popoverOpen: true,
      popoverAnchor: event.currentTarget,
      selectedTime: time,
      selectedAssigneeId: assigneeId
    })
  }

  selectedDateTime () {
    return setTime(this.state.selectedTime)(moment(this.props.date))
  }

  handleToggleOverrideMode ({ assigneeId }) {
    this.setState({ ...this.state,
      override: {
        isOverriding: !this.state.override.isOverriding,
        overrideAssigneeId: assigneeId
      }
    })
  }

  handleOverrideStart ({ time }) {
    if (this.state.override.isOverriding) {
      this.setState({ ...this.state,
        override: {
          ...this.state.override,
          start: time,
          end: time
        }
      })
    }
  }

  handleOverrideHover ({ time }) {
    this.setState({ ...this.state,
      override: {
        ...this.state.override,
        end: moment(time).add(5, 'minutes').subtract(1, 'second').toDate()
      }
    })
  }

  handleOverrideEnd ({ time }) {
    if (this.state.override.isOverriding) {
      let start = this.state.override.start
      let end = moment(time).add(5, 'minutes').subtract(1, 'second').toDate()

      if (this.state.override.start > this.state.override.end) {
        [ start, end ] = [ end, start ]
      }

      const newSchedule = {
        userId: this.state.override.overrideAssigneeId,
        start,
        end,
        available: false,
        type: 'override'
      }

      console.log('[Appointments] Schedules override end event', { newSchedule })

      Schedules.actions.upsert.callPromise({ schedule: newSchedule }).then(() => {
        this.setState({ ...this.state,
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

  handleOverrideStartOrEnd ({ time, assigneeId }) {
    if (this.state.override.start) {
      this.handleOverrideEnd({ time, assigneeId })
    } else {
      this.handleOverrideStart({ time, assigneeId })
    }
  }

  handleScheduleModalOpen ({ scheduleId }) {
    if (this.props.canEditSchedules) {
      this.setState({...this.state,
        scheduleModalOpen: true,
        scheduleModalId: scheduleId
      })
    }
  }

  handleScheduleModalClose () {
    this.setState({...this.state,
      scheduleModalOpen: false,
      scheduleModalId: null
    })
  }

  handleScheduleSoftRemove () {
    if (this.state.scheduleModalOpen && this.state.scheduleModalId) {
      Schedules.actions.softRemove.callPromise({ scheduleId: this.state.scheduleModalId }).then(() => {
        this.handleScheduleModalClose()
        Alert.success(TAPi18n.__('schedules.softRemoveSuccess'))
      })
    }
  }

  handleSetAdmitted (appointment) {
    this.props.onSetAdmitted({ appointmentId: appointment._id })
  }

  handleMoveStart (args) {
    this.setState({
      ...this.state,
      appointmentModalOpen: false
    })

    this.props.dispatch({
      type: 'APPOINTMENT_MOVE_START',
      ...args
    })
  }

  handleMoveHover ({ assigneeId, time }) {
    this.props.dispatch({
      type: 'APPOINTMENT_MOVE_HOVER',
      assigneeId,
      time
    })
  }

  handleMoveEnd () {
    this.props.onMove({
      appointmentId: this.props.move.moveAppointmentId,
      newStart: this.props.move.moveToTime,
      newAssigneeId: this.props.move.moveToAssigneeId
    }).then(() => {
      this.props.dispatch({
        type: 'APPOINTMENT_MOVE_END'
      })
    })
  }

  render () {
    return (
      <div>
        <HeaderRowContainer
          date={this.props.date}
          assignees={this.props.assignees}
          onToggleOverrideMode={this.handleToggleOverrideMode}
          overrideMode={this.state.override.isOverriding} />

        <AppointmentsGrid
          date={this.props.date}
          assignees={this.props.assignees}
          onAppointmentClick={this.handleAppointmentClick}
          onBlankClick={this.handleBlankClick}
          onBlankMouseEnter={this.handleBlankHover}
          override={this.state.override}
          onScheduleModalOpen={this.handleScheduleModalOpen}
          move={this.props.move} />

        <AppointmentInfoModal
          appointmentId={this.state.selectedAppointmentId}
          onStartMove={this.handleMoveStart}
          show={this.state.appointmentModalOpen}
          onClose={this.handleAppointmentModalClose} />

        <ScheduleModal
          show={this.state.scheduleModalOpen}
          onClose={this.handleScheduleModalClose}
          onClickScheduleSoftRemove={this.handleScheduleSoftRemove} />

        <NewAppointmentPopover
          open={this.state.popoverOpen}
          anchorEl={this.state.popoverAnchor}
          assigneeId={this.state.selectedAssigneeId}
          time={this.state.selectedTime}
          onClose={this.handleNewAppointmentPopoverClose} />
      </div>
    )
  }
}
