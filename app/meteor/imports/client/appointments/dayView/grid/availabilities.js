import React from 'react'
import injectSheet from 'react-jss'
import moment from 'moment-timezone'
import flatten from 'lodash/flatten'
import { setTime, formatter, label, start, end, timeSlotsRange } from './timeSlots'
import { background, unavailable, lighten } from '../../../layout/styles'

const styles = {
  blank: {
    backgroundColor: lighten(background, 10),
    borderBottom: `1px solid rgba(128, 128, 128, 0.2)`,
    marginLeft: 1,
    minHeight: 24,
    zIndex: 1,
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
        title={format(startTime)}
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

export const availabilities = ({ calendar, date, assignees, availabilities, onClick, onMouseEnter }) =>
  <>
    {assignees.map(assignee =>
      assignee
        // Block assignees by default
        ? <Unavailable
          key={assignee._id}
          assigneeId={assignee._id}
        />
        // Unassigned column is always available
        : <Available
          key={'unassigned'}
          availability={{
            slotSize: calendar.slotSize,
            from: start(),
            to: end(),
            date: date
          }}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          assigneeId={null}
        />
    )}

    {availabilities.map(availability =>
      <Available
        key={availability._id}
        availability={availability}
        date={date}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      />
    )}
  </>

const Available = ({
  availability: {
    _id,
    slotSize,
    from,
    to,
    pauses
  },
  date,
  onClick,
  onMouseEnter,
  assigneeId
}) => {
  const format = formatter(slotSize)

  return [
    ...timeSlotsRange({ slotSize, from, to })
      .map((time, i, times) => (
        <Blank
          key={[_id, time].join('')}
          date={date}
          startTime={time}
          endTime={times[i + 1] || label(moment(to))}
          format={format}
          assigneeId={assigneeId}
          onClick={onClick}
          onMouseEnter={onMouseEnter} />
      )),
    ...flatten(pauses ? pauses.map(({ from, to, note }) =>
      timeSlotsRange({ slotSize, from, to })
        .map((time, i, times) =>
          <Pause
            key={[_id, '-P', time].join('')}
            assigneeId={assigneeId}
            note={note}
            from={label(moment(from))}
            to={label(moment(to))}
          />
        )
    ) : [])
  ]
}

const unavailableStyle = {
  gridRowStart: label(start()),
  gridRowEnd: label(end()),
  zIndex: 0,
  borderRight: `1px solid ${lighten(unavailable, -6)}`,
  backgroundColor: unavailable
}

const Unavailable = ({ assigneeId }) =>
  <div style={{
    ...unavailableStyle,
    gridColumn: `assignee-${assigneeId || 'unassigned'}`
  }} />

const Pause = ({ note, from, to, assigneeId }) => {
  const style = {
    zIndex: 2,
    gridRowStart: from,
    gridRowEnd: to,
    backgroundColor: unavailable,
    gridColumn: `assignee-${assigneeId || 'unassigned'}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'center',
    color: lighten(unavailable, -25)
  }

  return <div style={style}>
    {note}
  </div>
}
