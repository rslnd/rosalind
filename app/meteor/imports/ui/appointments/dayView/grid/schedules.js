import React from 'react'
import moment from 'moment-timezone'
import { monkey } from 'spotoninc-moment-round'
import { isFirstSlot, isLastSlot } from './timeSlots'
import style from './schedulesStyle'

monkey(moment)

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
          className={style.scheduledUnavailable}
          onDoubleClick={(event) => onDoubleClick({ event, scheduleId: schedule._id })}
          style={{
            gridRowStart: timeStart.format('[T]HHmm'),
            gridRowEnd: timeEnd.format('[T]HHmm'),
            gridColumn: `assignee-${schedule.userId}`
          }}>

          <div className={style.schedulesText}>
            {!isFirstSlot(timeStart) && timeStart.format('H:mm')}
          </div>
          <div className={style.schedulesText}>
            {!isLastSlot(timeEnd) && timeEnd.format('H:mm')}
          </div>
        </div>
      )
    })
  ))
)
