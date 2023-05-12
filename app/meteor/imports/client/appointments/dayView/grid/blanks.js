import React from 'react'
import Alert from 'react-s-alert'
import injectSheet from 'react-jss'
import moment from 'moment-timezone'
import sortBy from 'lodash/sortBy'
import { setTime, timeSlots, formatter, label, end } from './timeSlots'
import { background, green, lighten } from '../../../layout/styles'
import { Icon } from '../../../components/Icon'
import { __ } from '../../../../i18n'
import { Appointments } from '../../../../api'

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

const bookableIndicatorStyle = {
  color: '#ccc',
  opacity: 0.9,
  zoom: 0.8,
  paddingTop: 3,
  paddingBottom: 3,
  paddingLeft: 8,
  paddingRight: 6,
  borderLeft: '1px solid #efefef'
}

const BookableIndicator = ({ ...props }) =>
  <div
    style={bookableIndicatorStyle}
    title={__('appointments.setBookable')}
    {...props}
  >
      <Icon name='square-o' />
  </div>


class BlankState extends React.PureComponent {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleOnMouseEnter = this.handleOnMouseEnter.bind(this)
    this.handleBookableClick = this.handleBookableClick.bind(this)
  }

  handleClick (event) {
    this.props.onClick({
      event,
      start: setTime(this.props.startTime)(moment(this.props.date)).toDate(),
      end: setTime(this.props.endTime)(moment(this.props.date)).toDate(),
      assigneeId: this.props.assigneeId
    })
  }

  handleOnMouseEnter (event) {
    this.props.onMouseEnter({
      event,
      start: setTime(this.props.startTime)(moment(this.props.date)).toDate(),
      end: setTime(this.props.endTime)(moment(this.props.date)).toDate(),
      assigneeId: this.props.assigneeId
    })
  }

  handleBookableClick (event) {
    event.preventDefault()
    event.stopPropagation()
    Appointments.actions.setBookable.callPromise({
      calendarId: this.props.calendar._id,
      start: setTime(this.props.startTime)(moment(this.props.date)).toDate(),
      end: setTime(this.props.endTime)(moment(this.props.date)).toDate(),
      assigneeId: this.props.assigneeId
    }).then(a => {
      if (a) {
        Alert.success(__('appointments.setBookableSuccess'))
      }
    }).catch(e => {
      console.error(e)
      Alert.error(e.message)
    })
  }

  render () {
    const { startTime, endTime, assigneeId, classes, format, canEditBookables } = this.props

    return (
      <span
        className={classes.blank}
        onClick={this.handleClick}
        onMouseEnter={this.handleOnMouseEnter}
        title={format(startTime)}
        style={{
          gridRowStart: startTime,
          gridRowEnd: endTime,
          gridColumn: `assignee-${assigneeId || 'unassigned'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          {assigneeId && canEditBookables &&
            <BookableIndicator
              onClick={this.handleBookableClick}
              onMouseEnter={e => e.buttons === 1 && this.handleBookableClick(e)}
              onMouseDown={e => e.buttons === 1 && this.handleBookableClick(e)}
            />
          }
        &nbsp;
      </span>
    )
  }
}

const Blank = injectSheet(styles)(BlankState)

export const blanks = ({ calendar, date, assignees, onClick, onMouseEnter, canSeeBookables, canEditBookables }) => {
  const { slotSize, slotSizeAppointment, allowUnassigned, atMinutes } = calendar

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

    const unixday = date.unix()

    return timeSlots(slotSizeBlank, scheduleOffset, atMinutes)
      .map((time, i, times) => (
        <Blank
          key={[unixday, time, a ? a._id : 'unassigned'].join('')}
          calendar={calendar}
          date={date}
          startTime={time}
          endTime={times[i + 1] || lastSlot}
          format={format}
          assigneeId={a ? a._id : null}
          onClick={onClick}
          canSeeBookables={canSeeBookables}
          canEditBookables={canEditBookables}
          onMouseEnter={onMouseEnter} />
      ))
  })
}
