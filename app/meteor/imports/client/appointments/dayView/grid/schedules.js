import { Meteor } from 'meteor/meteor'
import React from 'react'
import moment from 'moment-timezone'
import { monkey } from 'spotoninc-moment-round'
import { isFirstSlot, isLastSlot } from './timeSlots'
import { darkGrayDisabled } from '../../../layout/styles'
import { hasRole } from '../../../../util/meteor/hasRole'

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

export const schedules = ({ schedules, onDoubleClick, slotSize }) =>
  schedules.map(s =>
    <Schedule
      key={s._id}
      scheduleId={s._id}
      assigneeId={s.userId}
      start={s.start}
      end={s.end}
      note={s.note}
      roles={s.roles}
      slotSize={slotSize}
      onDoubleClick={onDoubleClick}
    />
  )

const Schedule = ({ start, end, note, roles, scheduleId, assigneeId, slotSize, onDoubleClick }) => {
  const timeStart = moment(start).floor(5, 'minutes')
  const timeEnd = moment(end).ceil(5, 'minutes')
  const duration = (end - start) / 1000 / 60

  if (roles && roles.length >= 1) {
    if (!hasRole(Meteor.userId(), roles)) {
      return null
    }
  }

  return (
    <div
      data-scheduleid={scheduleId}
      onDoubleClick={(event) => onDoubleClick({ event, scheduleId })}
      style={{
        ...style.scheduledUnavailable,
        gridRowStart: timeStart.format('[T]HHmm'),
        gridRowEnd: timeEnd.format('[T]HHmm'),
        gridColumn: `assignee-${assigneeId || 'unassigned'}`
      }}>

      {
        (duration - (note ? slotSize : 0)) > slotSize
          ? [
            <div key={1} style={style.schedulesText}>
              {!isFirstSlot(timeStart) && timeStart.format('H:mm')}
            </div>,
            note ? <div key={2} style={style.schedulesText}>
              {note}
            </div> : null,
            <div key={3} style={style.schedulesText}>
              {!isLastSlot(timeEnd) && timeEnd.format('H:mm')}
            </div>
          ] : <div style={style.schedulesText}>
            {timeStart.format('H:mm')} - {timeEnd.format('H:mm')}
            {note && <span> {note}</span>}
          </div>
      }
    </div>
  )
}
