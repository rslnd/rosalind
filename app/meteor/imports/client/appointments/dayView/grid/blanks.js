import React from 'react'
import injectSheet from 'react-jss'
import moment from 'moment-timezone'
import { setTime, timeSlots, formatter } from './timeSlots'
import { background } from '../../../css/global'
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

class BlankState extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleOnMouseEnter = this.handleOnMouseEnter.bind(this)
  }

  handleClick (event) {
    this.props.onClick({
      event,
      time: setTime(this.props.time)(moment(this.props.date)).toDate(),
      assigneeId: this.props.assigneeId
    })
  }

  handleOnMouseEnter (event) {
    this.props.onMouseEnter({
      event,
      time: setTime(this.props.time)(moment(this.props.date)).toDate(),
      assigneeId: this.props.assigneeId
    })
  }

  render () {
    const { time, assigneeId, classes, format } = this.props

    return (
      <span
        className={classes.blank}
        onClick={this.handleClick}
        onMouseEnter={this.handleOnMouseEnter}
        title={format(time)}
        style={{
          gridRow: time,
          gridColumn: `assignee-${assigneeId}`
        }}>
        &nbsp;
      </span>
    )
  }
}

const Blank = injectSheet(styles)(BlankState)

export const blanks = ({ slotSize, date, assignees, onClick, onMouseEnter }) => {
  const format = formatter(slotSize)

  return assignees.map((assignee, i) => (
    timeSlots(slotSize)
      .map((time, j) => (
        <Blank
          key={[i, j].join('')}
          date={date}
          time={time}
          format={format}
          assigneeId={assignee.assigneeId}
          onClick={onClick}
          onMouseEnter={onMouseEnter} />
      ))
  ))
}
