import moment from 'moment'
import 'moment-range'
import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { Sticky } from 'react-sticky'
import { TAPi18n } from 'meteor/tap:i18n'
import { Appointment } from './Appointment'
import { AppointmentInfo } from './AppointmentInfo'
import style from './style'

export class AppointmentsView extends React.Component {
  constructor (props) {
    super(props)

    const options = {
      start: moment().hour(7).startOf('hour'),
      end: moment().hour(19).endOf('hour')
    }

    this.state = {
      timeRange: moment.range(options.start, options.end).toArray('minutes'),
      appointmentModalOpen: false,
      appointmentModalContent: {}
    }

    this.handleAppointmentModalOpen = this.handleAppointmentModalOpen.bind(this)
    this.handleAppointmentModalClose = this.handleAppointmentModalClose.bind(this)
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
      gridTemplateRows: `[header] 40px [subheader] 40px ${this.state.timeRange.map((time) => `[time-${moment(time).format('HHmm')}] 4px`).join(' ')}`
    }
  }

  handleAppointmentModalOpen (appointment) {
    this.setState({ ...this.state, appointmentModalOpen: true, appointmentModalContent: appointment })
  }

  handleAppointmentModalClose () {
    this.setState({ ...this.state, appointmentModalOpen: false })
  }

  render () {
    return (
      <div>
        <Sticky
          className={style.headerRow}
          stickyClassName={style.headerRowSticky}
          topOffset={-60}>
          <div style={{width: '60px'}}></div>
          {this.props.assignees.map((assignee) => (
            <div key={assignee.assigneeId} className={style.headerCell}>
              {assignee.fullNameWithTitle}
            </div>
          ))}
        </Sticky>

        <div style={this.grid()}>
          {this.props.assignees.map((assignee) => (
            assignee.appointments.map((appointment) => (
              <Appointment
                key={appointment._id}
                appointment={appointment}
                handleAppointmentModalOpen={this.handleAppointmentModalOpen} />
            ))
          ))}

          {
            this.state.timeRange
              .map((t) => moment(t))
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
      </div>
    )
  }
}
