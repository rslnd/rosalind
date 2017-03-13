import React from 'react'
import blanksStyle from './blanksStyle'
import { timeSlots, format } from './timeSlots'

class Blank extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleOnMouseEnter = this.handleOnMouseEnter.bind(this)
  }

  handleClick (event) {
    this.props.onClick({
      event,
      time: this.props.time,
      assigneeId: this.props.assigneeId
    })
  }

  handleOnMouseEnter (event) {
    this.props.onMouseEnter({
      event,
      time: this.props.time,
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
        onMouseEnter={this.onMouseEnter}
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

export const blanks = ({ assignees, onClick, onMouseEnter }) => (
  assignees.map((assignee) => (
    timeSlots
      .map((time) => (
        <Blank
          time={time}
          assigneeId={assignee.assigneeId}
          onClick={onClick}
          onMouseEnter={onMouseEnter} />
      ))
  ))
)
