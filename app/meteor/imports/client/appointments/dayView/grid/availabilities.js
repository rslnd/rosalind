import React from 'react'
import injectSheet from 'react-jss'
import moment from 'moment-timezone'
import flatten from 'lodash/flatten'
import { setTime, timeSlots, formatter, label, end, timeSlotsRange } from './timeSlots'
import { background } from '../../../layout/styles'
import { color, lightness } from 'kewler'

const styles = {
  blank: {
    backgroundColor: color(background, lightness(10)),
    borderBottom: `1px solid rgba(128, 128, 128, 0.2)`,
    marginLeft: 2,
    minHeight: 24,
    '&:hover': {
      backgroundColor: color(background, lightness(3))
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
        title={format(startTime)}
        style={{
          gridRowStart: startTime,
          gridRowEnd: endTime,
          gridColumn: `assignee-${assigneeId}`
        }}>
        &nbsp;
      </span>
    )
  }
}

const Blank = injectSheet(styles)(BlankState)

export const availabilities = ({ calendar, date, assignees, onClick, onMouseEnter }) =>
  flatten(assignees.map(assignee =>
    flatten(assignee.availabilities.map(availability => {
      const { slotSize, from, to } = availability
      const format = formatter(slotSize)

      console.log(availability._id, timeSlotsRange({ slotSize, from, to }))

      return timeSlotsRange({ slotSize, from, to })
        .map((time, i, times) => (
          <Blank
            key={[availability._id, time].join('')}
            date={date}
            startTime={time}
            endTime={times[i + 1] || label(moment(to))}
            format={format}
            assigneeId={assignee.assigneeId}
            onClick={onClick}
            onMouseEnter={onMouseEnter} />
        ))
    }))
  ))
