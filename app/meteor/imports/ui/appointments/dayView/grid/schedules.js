import React from 'react'
import moment from 'moment-timezone'
import { monkey } from 'spotoninc-moment-round'
import { isFirstSlot, isLastSlot } from './timeSlots'
import { darkGrayDisabled } from '../../../css/global'

monkey(moment)

const style = {
  scheduledUnavailable: {
    background: darkGrayDisabled,
    opacity: 0.5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  schedulesText: {
    textAlign: 'center'
  }
}

export const schedules = ({ assignees, onDoubleClick }) => (
  assignees.map((assignee) => (
    assignee.schedules && assignee.schedules.map((schedule) => {
      if (!schedule.start && !schedule.end) {
        return null
      }
      const timeStart = moment(schedule.start).floor(5, 'minutes')
      const timeEnd = moment(schedule.end).ceil(5, 'minutes')

      return (
        <div
          key={`schedule-${schedule._id}`}
          data-scheduleId={schedule._id}
          onDoubleClick={(event) => onDoubleClick({ event, scheduleId: schedule._id })}
          style={{
            ...style.scheduledUnavailable,
            gridRowStart: timeStart.format('[T]HHmm'),
            gridRowEnd: timeEnd.format('[T]HHmm'),
            gridColumn: `assignee-${schedule.userId}`
          }}>

          <div style={style.schedulesText}>
            {!isFirstSlot(timeStart) && timeStart.format('H:mm')}
          </div>
          <div style={style.schedulesText}>
            {!isLastSlot(timeEnd) && timeEnd.format('H:mm')}
          </div>
        </div>
      )
    })
  ))
)
