import memoize from 'lodash/memoize'
import moment from 'moment'
import 'moment-range'
import { monkey } from 'spotoninc-moment-round'
import React from 'react'
import classnames from 'classnames'
import { Modal } from 'react-bootstrap'
import { Popover, PopoverAnimationVertical } from 'material-ui/Popover'
import FlatButton from 'material-ui/FlatButton'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'
import { Appointment } from './appointment/Appointment'
import { AppointmentInfoContainer } from 'client/ui/appointments/info/AppointmentInfoContainer'
import { NewAppointmentContainer } from 'client/ui/appointments/new/NewAppointmentContainer'
import { HeaderRowContainer } from 'client/ui/appointments/dayView/header/HeaderRowContainer'
import style from './style'
import { Schedules } from 'api/schedules'

monkey(moment)

const viewRange = (date) => {
  return {
    start: moment(date).hour(7).minute(30).startOf('minute'),
    end: moment(date).hour(20).endOf('hour')
  }
}

const calculateTimeRange = memoize((date) => {
  const range = viewRange(date)
  return moment.range(range.start, range.end).toArray('minutes').map((t) => moment(t))
})

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
      move: false,
      moveAppointmentId: null,
      moveToAssigneeId: null,
      moveToTime: null
    }

    this.handleAppointmentClick = this.handleAppointmentClick.bind(this)
    this.handleAppointmentModalOpen = this.handleAppointmentModalOpen.bind(this)
    this.handleAppointmentModalClose = this.handleAppointmentModalClose.bind(this)
    this.handlePopoverOpen = this.handlePopoverOpen.bind(this)
    this.handlePopoverClose = this.handlePopoverClose.bind(this)
    this.handleToggleOverrideMode = this.handleToggleOverrideMode.bind(this)
    this.handleOverrideStart = this.handleOverrideStart.bind(this)
    this.handleOverrideEnd = this.handleOverrideEnd.bind(this)
    this.handleOverrideStartOrEnd = this.handleOverrideStartOrEnd.bind(this)
    this.handleNewAppointmentClick = this.handleNewAppointmentClick.bind(this)
    this.handleNewAppointmentHover = this.handleNewAppointmentHover.bind(this)
    this.handleOverrideHover = this.handleOverrideHover.bind(this)
    this.handleScheduleModalOpen = this.handleScheduleModalOpen.bind(this)
    this.handleScheduleModalClose = this.handleScheduleModalClose.bind(this)
    this.handleScheduleSoftRemove = this.handleScheduleSoftRemove.bind(this)
    this.handleSetAdmitted = this.handleSetAdmitted.bind(this)
    this.handleMoveStart = this.handleMoveStart.bind(this)
    this.handleMoveHover = this.handleMoveHover.bind(this)
    this.handleMoveEnd = this.handleMoveEnd.bind(this)
    this.timeRange = this.timeRange.bind(this)
    this.grid = this.grid.bind(this)
  }

  timeRange () {
    return calculateTimeRange(this.props.date)
  }

  // row name    | column names
  // ---------------------------------------------------------------
  // [header]    | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // [time-0800] | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // [time-0805] | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // [time-0810] | [time] [assignee-1] [assignee-2] ... [assignee-n]
  // ...         | ...
  // [time-2100] | [time] [assignee-1] [assignee-2] ... [assignee-n]
  grid () {
    return {
      gridTemplateColumns: `
        [time] 60px
        ${this.props.assignees.map((assignee, index) =>
          `[assignee-${assignee.assigneeId}] 1fr`).join(' ')
        }`,
      gridTemplateRows: `
        [header] 40px
        [subheader] 40px
        ${this.timeRange().map((time) =>
          `[time-${time.format('HHmm')}] 5px`).join(' ')
        }`
    }
  }

  handleAppointmentClick (event, appointment) {
    if (this.state.move) {
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

  handleNewAppointmentClick (options) {
    if (this.state.overrideMode) {
      this.handleOverrideStartOrEnd(options)
    } else {
      this.handlePopoverOpen(options)
    }
  }

  handleNewAppointmentHover (options) {
    if (this.state.overrideMode) {
      this.handleOverrideHover(options)
    } else if (this.state.move) {
      this.handleMoveHover(options)
    }
  }

  handlePopoverClose () {
    if (this.props.onPopoverClose) {
      this.props.onPopoverClose({
        time: this.state.selectedTime,
        assigneeId: this.state.selectedAssigneeId
      })
    }

    this.setState({ ...this.state, popoverOpen: false })
  }

  handlePopoverOpen ({ event, time, assigneeId }) {
    event.preventDefault()

    if (this.props.onPopoverOpen) {
      this.props.onPopoverOpen({ time, assigneeId })
    }

    this.setState({ ...this.state,
      popoverOpen: true,
      popoverAnchor: event.currentTarget,
      selectedTime: time,
      selectedAssigneeId: assigneeId
    })
  }

  handleToggleOverrideMode ({ assigneeId }) {
    this.setState({ ...this.state,
      overrideMode: !this.state.overrideMode,
      overrideAssigneeId: assigneeId
    })
  }

  handleOverrideStart ({ time }) {
    if (this.state.overrideMode) {
      this.setState({ ...this.state,
        overrideStart: time,
        overrideEnd: time
      })
    }
  }

  handleOverrideHover ({ time }) {
    this.setState({ ...this.state,
      overrideEnd: moment(time).add(5, 'minutes').subtract(1, 'second').toDate()
    })
  }

  handleOverrideEnd ({ time }) {
    if (this.state.overrideMode) {
      let start = this.state.overrideStart
      let end = moment(time).add(5, 'minutes').subtract(1, 'second').toDate()

      if (this.state.overrideStart > this.state.overrideEnd) {
        [ start, end ] = [ end, start ]
      }

      const newSchedule = {
        userId: this.state.overrideAssigneeId,
        start,
        end,
        available: false,
        type: 'override'
      }

      console.log('[Appointments] Schedules override end event', { newSchedule })

      Schedules.actions.upsert.callPromise({ schedule: newSchedule }).then(() => {
        this.setState({ ...this.state,
          overrideMode: false,
          overrideStart: null,
          overrideEnd: null,
          overrideAssigneeId: null
        })
      })
    }
  }

  handleOverrideStartOrEnd ({ time, assigneeId }) {
    if (this.state.overrideStart) {
      this.handleOverrideEnd({ time, assigneeId })
    } else {
      this.handleOverrideStart({ time, assigneeId })
    }
  }

  handleScheduleModalOpen ({ scheduleId }) {
    this.setState({...this.state,
      scheduleModalOpen: true,
      scheduleModalId: scheduleId
    })
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

  handleMoveStart ({ appointmentId }) {
    this.setState({
      ...this.state,
      appointmentModalOpen: false,
      move: true,
      moveAppointmentId: appointmentId
    })
  }

  handleMoveHover ({ assigneeId, time }) {
    this.setState({
      ...this.state,
      moveToAssigneeId: assigneeId,
      moveToTime: time
    })
  }

  handleMoveEnd () {
    this.props.onMove({
      appointmentId: this.state.moveAppointmentId,
      newStart: this.state.moveToTime,
      newAssigneeId: this.state.moveToAssigneeId
    })

    this.setState({
      ...this.state,
      move: false,
      moveAppointmentId: null
    })
  }

  render () {
    return (
      <div>
        <HeaderRowContainer
          date={this.props.date}
          assignees={this.props.assignees}
          onToggleOverrideMode={this.handleToggleOverrideMode}
          overrideMode={this.state.overrideMode} />

        <div className={style.grid} style={this.grid()}>
          {/* Appointments */}
          {this.props.assignees.map((assignee) => (
            assignee.appointments.map((appointment) => (
              <Appointment
                key={appointment._id}
                appointment={appointment}
                isMoving={this.state.moveAppointmentId === appointment._id}
                moveToAssigneeId={this.state.moveToAssigneeId}
                moveToTime={this.state.moveToTime}
                onClick={this.handleAppointmentClick} />
            ))
          ))}

          {/* New Appointment Triggers */}
          {this.props.assignees.map((assignee) => (
            this.timeRange()
              .filter((t) => t.minute() % 5 === 0)
              .map((time) => {
                const timeKey = time.format('[time-]HHmm')
                const assigneeId = assignee.assigneeId
                return (
                  <span
                    key={`new-${assigneeId}-${timeKey}`}
                    className={style.newAppointmentTrigger}
                    onClick={(event) => this.handleNewAppointmentClick({ event, assigneeId, time: time.toDate() })}
                    onMouseEnter={(event) => this.handleNewAppointmentHover({ event, assigneeId, time: time.toDate() })}
                    title={time.format('H:mm')}
                    style={{
                      gridRow: timeKey,
                      gridColumn: `assignee-${assigneeId}`
                    }}>
                    &nbsp;
                  </span>
                )
              })
          ))}

          {/* New Override Mode */}
          {
            this.state.overrideStart && (() => {
              const start = moment(this.state.overrideStart)
              const end = moment(this.state.overrideEnd).add(1, 'second')

              return (
                <div
                  key="override-start"
                  className={style.overrideOverlay}
                  style={{
                    gridRowStart: start.format('[time-]HHmm'),
                    gridRowEnd: end.format('[time-]HHmm'),
                    gridColumn: `assignee-${this.state.overrideAssigneeId}`
                  }}>
                  <div>{start.format('H:mm')}</div>
                  <div>{end.format('H:mm')}</div>
                </div>
              )
            })()
          }

          {/* Schedules */}
          {
            this.props.assignees.map((assignee) => (
              assignee.schedules && assignee.schedules.map((schedule) => {
                if (!schedule.start && !schedule.end) {
                  return null
                }
                const timeStart = moment(schedule.start).floor(5, 'minutes')
                const timeEnd = moment(schedule.end).ceil(5, 'minutes')

                return (
                  <div
                    key={`schedule-${schedule._id}`}
                    data-scheduleId={schedule._id}
                    className={style.scheduledUnavailable}
                    onDoubleClick={() => this.handleScheduleModalOpen({ scheduleId: schedule._id })}
                    style={{
                      gridRowStart: timeStart.format('[time-]HHmm'),
                      gridRowEnd: timeEnd.format('[time-]HHmm'),
                      gridColumn: `assignee-${schedule.userId}`
                    }}>

                    <div className={style.schedulesText}>
                      {!timeStart.isSame(moment(viewRange(timeStart).start).floor(5, 'minutes'), 'minute') && timeStart.format('H:mm')}
                    </div>
                    <div className={style.schedulesText}>
                      {!timeEnd.isSame(moment(viewRange(timeEnd).end).ceil(5, 'minutes'), 'minute') && timeEnd.format('H:mm')}
                    </div>
                  </div>
                )
              })
            ))
          }

          {/* Time Legend */}
          {
            this.timeRange()
              .filter((t) => t.minute() % 5 === 0)
              .map((time) => {
                const fullHour = time.minute() === 0
                const quarterHour = time.minute() % 15 === 0
                const timeKey = time.format('[time-]HHmm')
                const classes = classnames({
                  [ style.fullHour ]: fullHour,
                  [ style.quarterHour ]: quarterHour,
                  [ style.timeLegend ]: true
                })

                return (
                  <span
                    key={timeKey}
                    id={timeKey}
                    className={classes}
                    style={{
                      gridRow: timeKey,
                      gridColumn: 'time'
                    }}>
                    {time.format('H:mm')}
                  </span>
                )
              })
          }
        </div>

        <Modal
          enforceFocus={false}
          show={this.state.appointmentModalOpen}
          onHide={this.handleAppointmentModalClose}
          bsSize="large">
          <Modal.Body>
            <AppointmentInfoContainer
              onRequestClose={this.handleAppointmentModalClose}
              onStartMove={this.handleMoveStart}
              appointmentId={this.state.selectedAppointmentId}
              onClose={this.handleAppointmentModalClose} />
          </Modal.Body>
          <Modal.Footer>
            <div className="pull-right">
              <FlatButton
                onClick={this.handleAppointmentModalClose}
                label={TAPi18n.__('ui.close')} />
            </div>
          </Modal.Footer>
        </Modal>

        <Modal
          enforceFocus={false}
          show={this.state.scheduleModalOpen}
          onHide={this.handleScheduleModalClose}
          bsSize="large">
          <Modal.Body>
            <FlatButton
              onClick={this.handleScheduleSoftRemove}
              label={<span>
                <Icon name="trash-o" />&emsp;
                {TAPi18n.__('schedules.softRemove')}
              </span>} />
          </Modal.Body>
          <Modal.Footer>
            <div className="pull-right">
              <FlatButton
                onClick={this.handleScheduleModalClose}
                label={TAPi18n.__('ui.close')} />
            </div>
          </Modal.Footer>
        </Modal>

        <Popover
          open={this.state.popoverOpen}
          anchorEl={this.state.popoverAnchor}
          animated
          animation={PopoverAnimationVertical}
          anchorOrigin={{
            horizontal: this.state.selectedAssigneeId ? 'middle' : 'right',
            vertical: 'top'
          }}
          targetOrigin={{
            horizontal: this.state.selectedAssigneeId ? 'middle' : 'right',
            vertical: 'bottom'
          }}
          style={{ overflowY: 'visible' }}
          autoCloseWhenOffScreen={false}
          onRequestClose={this.handlePopoverClose}
          >
          <div className={style.popover}>
            <NewAppointmentContainer
              assigneeId={this.state.selectedAssigneeId}
              time={this.state.selectedTime}
              onClose={this.handlePopoverClose} />
          </div>
        </Popover>
      </div>
    )
  }
}
