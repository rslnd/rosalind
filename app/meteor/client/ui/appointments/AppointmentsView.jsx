import moment from 'moment'
import 'moment-range'
import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { Sticky } from 'react-sticky'
import Popover from 'material-ui/Popover'
import { TAPi18n } from 'meteor/tap:i18n'
import { Appointment } from './Appointment'
import { AppointmentInfo } from './AppointmentInfo'
import { NewAppointmentContainer } from './NewAppointmentContainer'
import style from './style'

export class AppointmentsView extends React.Component {
  constructor (props) {
    super(props)

    const options = {
      start: moment(props.date).hour(7).startOf('hour'),
      end: moment(props.date).hour(21).endOf('hour')
    }

    this.state = {
      timeRange: moment.range(options.start, options.end).toArray('minutes').map((t) => moment(t)),
      selectedTime: null,
      selectedAssigneeId: null,
      popoverOpen: false,
      popoverAnchor: null,
      appointmentModalOpen: false,
      appointmentModalContent: {}
    }

    this.handleAppointmentModalOpen = this.handleAppointmentModalOpen.bind(this)
    this.handleAppointmentModalClose = this.handleAppointmentModalClose.bind(this)
    this.handlePopoverOpen = this.handlePopoverOpen.bind(this)
    this.handlePopoverClose = this.handlePopoverClose.bind(this)
    this.grid = this.grid.bind(this)
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
      display: 'grid',
      gridTemplateColumns: `[time] 60px ${this.props.assignees.map((assignee, index) =>
        `[assignee-${assignee.assigneeId}] 1fr`).join(' ')}`,
      gridTemplateRows: `[header] 40px [subheader] 40px ${this.state.timeRange.map((time) => `[time-${time.format('HHmm')}] 4px`).join(' ')}`
    }
  }

  handleAppointmentModalOpen (appointment) {
    this.setState({ ...this.state, appointmentModalOpen: true, appointmentModalContent: appointment })
  }

  handleAppointmentModalClose () {
    this.setState({ ...this.state, appointmentModalOpen: false })
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

  render () {
    return (
      <div>
        {/* Assignees */}
        <Sticky
          className={style.headerRow}
          stickyClassName={style.headerRowSticky}
          topOffset={-60}>
          <div style={{width: '60px'}}></div>
          {this.props.assignees.map((assignee) => (
            <div key={assignee.assigneeId} className={style.headerCell}>
              {
                assignee.fullNameWithTitle
                ? assignee.fullNameWithTitle
                : TAPi18n.__('appointments.unassigned')
              }
            </div>
          ))}
        </Sticky>

        <div style={this.grid()}>
          {/* Appointments */}
          {this.props.assignees.map((assignee) => (
            assignee.appointments.map((appointment) => (
              <Appointment
                key={appointment._id}
                appointment={appointment}
                handleAppointmentModalOpen={this.handleAppointmentModalOpen} />
            ))
          ))}

          {/* New Appointment Triggers */}
          {this.props.assignees.map((assignee) => (
            this.state.timeRange
              .filter((t) => t.minute() % 5 === 0)
              .map((time) => {
                const timeKey = time.format('[time-]HHmm')
                const assigneeId = assignee.assigneeId
                return (
                  <span
                    key={`new-${assigneeId}-${timeKey}`}
                    className={style.newAppointmentTrigger}
                    onClick={(event) => this.handlePopoverOpen({ event, assigneeId, time: time.toDate() })}
                    style={{
                      gridRow: timeKey,
                      gridColumn: `assignee-${assigneeId}`
                    }}>
                    &nbsp;
                  </span>
                )
              })
          ))}

          {/* Schedules */}
          {
            this.props.assignees.map((assignee) => (
              assignee.schedules.map((schedule) => {
                if (!schedule.start && !schedule.end) {
                  return null
                }
                const timeStart = moment(schedule.start).format('[time-]HHmm')
                const timeEnd = moment(schedule.end).format('[time-]HHmm')

                return (
                  <div
                    key={`schedule-${schedule._id}`}
                    data-scheduleId={schedule._id}
                    className={style.scheduledUnavailable}
                    style={{
                      gridRowStart: timeStart,
                      gridRowEnd: timeEnd,
                      gridColumn: `assignee-${assignee.assigneeId}`
                    }}>
                    &nbsp;
                  </div>
                )
              })
            ))
          }

          {/* Time Legend */}
          {
            this.state.timeRange
              .filter((t) => t.minute() % 15 === 0)
              .map((time) => {
                const fullHour = time.minute() === 0
                const timeKey = time.format('[time-]HHmm')
                return (
                  <span
                    key={timeKey}
                    className={`${style.timeLegend} ${fullHour && style.fullHour}`}
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
            <AppointmentInfo appointment={this.state.appointmentModalContent} />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleAppointmentModalClose} bsStyle="primary" pullRight>{TAPi18n.__('ui.close')}</Button>
          </Modal.Footer>
        </Modal>

        <Popover
          open={this.state.popoverOpen}
          anchorEl={this.state.popoverAnchor}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          autoCloseWhenOffScreen={false}
          onRequestClose={this.handlePopoverClose}
          >
          <div className={style.popover}>
            <NewAppointmentContainer assigneeId={this.state.selectedAssigneeId} time={this.state.selectedTime} />
          </div>
        </Popover>
      </div>
    )
  }
}
