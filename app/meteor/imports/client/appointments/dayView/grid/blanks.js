import React from 'react'
import injectSheet from 'react-jss'
import moment from 'moment-timezone'
import { setTime, timeSlots, format } from './timeSlots'
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
    const { time, assigneeId, classes } = this.props

    return (
      <span
        key={`new-${assigneeId}-${time}`}
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

export const blanks = ({ date, assignees, onClick, onMouseEnter }) => (
  assignees.map((assignee) => (
    timeSlots
      .map((time) => (
        <Blank
          date={date}
          time={time}
          assigneeId={assignee.assigneeId}
          onClick={onClick}
          onMouseEnter={onMouseEnter} />
      ))
  ))
)
