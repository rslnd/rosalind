import React from 'react'
import injectSheet from 'react-jss'
import moment from 'moment-timezone'
import sortBy from 'lodash/sortBy'
import { setTime, timeSlots, formatter, label, end } from './timeSlots'
import { background, lighten } from '../../../layout/styles'

const styles = {
  blank: {
    backgroundColor: lighten(background, 10),
    borderBottom: `1px solid rgba(128, 128, 128, 0.2)`,
    marginLeft: 2,
    minHeight: 24,
    '&:hover': {
      backgroundColor: lighten(background)
    }
  }
}

class BlankState extends React.PureComponent {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleOnMouseEnter = this.handleOnMouseEnter.bind(this)
  }

  handleClick (event) {
    this.props.onClick({
      event,
      time: setTime(this.props.startTime)(moment(this.props.date)).toDate(),
      assigneeId: this.props.assigneeId
    })
  }

  handleOnMouseEnter (event) {
    this.props.onMouseEnter({
      event,
      time: setTime(this.props.startTime)(moment(this.props.date)).toDate(),
      assigneeId: this.props.assigneeId
    })
  }

  render () {
    const { startTime, endTime, assigneeId, classes, format } = this.props

    return (
      <span
        className={classes.blank}
        onClick={this.handleClick}
        onMouseEnter={this.handleOnMouseEnter}
        title={format(endTime)}
        style={{
          gridRowStart: startTime,
          gridRowEnd: endTime,
          gridColumn: `assignee-${assigneeId || 'unassigned'}`
        }}>
        &nbsp;
      </span>
    )
  }
}

const Blank = injectSheet(styles)(BlankState)

export const blanks = ({ calendar, date, assignees, onClick, onMouseEnter }) => {
  const { slotSize, slotSizeAppointment, allowUnassigned } = calendar

  return assignees.map(a => {
    if (!a && !allowUnassigned) { return }

    const scheduleOffset = slotSizeAppointment &&
      (a && a.schedules && a.schedules.length >= 1) &&
      moment(sortBy(a.schedules, 'end')[0].end).add(1, 'second').minute()

    const slotSizeBlank = (scheduleOffset === 0 || scheduleOffset > 0)
      ? slotSizeAppointment
      : slotSize

    const format = formatter(slotSizeBlank, scheduleOffset)

    const lastSlot = label(end())

    return timeSlots(slotSizeBlank, scheduleOffset)
      .map((time, i, times) => (
        <Blank
          key={[date.unix(), time, a ? a._id : 'unassigned'].join('')}
          date={date}
          startTime={time}
          endTime={times[i + 1] || lastSlot}
          format={format}
          assigneeId={a ? a._id : null}
          onClick={onClick}
          onMouseEnter={onMouseEnter} />
      ))
  })
}
