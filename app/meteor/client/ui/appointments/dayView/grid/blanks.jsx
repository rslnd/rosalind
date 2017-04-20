import moment from 'moment'
import React from 'react'
import blanksStyle from './blanksStyle'
import { setTime, timeSlots, format } from './timeSlots'

class Blank extends React.Component {
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
    const { time, assigneeId } = this.props

    return (
      <span
        key={`new-${assigneeId}-${time}`}
        className={blanksStyle.blank}
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
