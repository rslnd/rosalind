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
  overlay: {
    background: '#b91212',
    // pointerEvents: 'none',
    opacity: 0.2,
    display: 'flex',
  },
  schedulesText: {
    textAlign: 'center'
  }
}

export const schedules = ({ schedules, onDoubleClick, slotSize, override }) => {
  const removeOverlay = override && override.removeOverlay

  return schedules.map(s =>
    <Schedule
      key={s._id}
      scheduleId={s._id}
      assigneeId={s.userId}
      slotSize={slotSize}
      clickable={removeOverlay}

      onDoubleClick={(
        (s.type === 'overlay' && removeOverlay) ||
        (s.type === 'override')
      ) ? onDoubleClick : undefined}

      onClick={
        (s.type === 'overlay' && removeOverlay) ? onDoubleClick : undefined
      }

      {...s}
    />
  )
}

const Schedule = ({ available, type, start, end, note, roles, scheduleId, assigneeId, slotSize, onDoubleClick, onClick, ...props }) => {
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
      onDoubleClick={onDoubleClick && ((event) => onDoubleClick({ event, scheduleId }))}
      onClick={onClick && ((event) => onClick({ event, scheduleId }))}
      style={{
        ...(type === 'overlay' ? style.overlay : style.scheduledUnavailable),
        pointerEvents: onDoubleClick ? 'all' : 'none',
        gridRowStart: timeStart.format('[T]HHmm'),
        gridRowEnd: timeEnd.format('[T]HHmm'),
        gridColumn: `assignee-${assigneeId || 'unassigned'}`
      }}
      {...props}
    >
      {
        (
          (
            (type === 'override') &&
            (duration - (note ? slotSize : 0)) > slotSize) &&
            (duration > 15)
          )
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
          ]
          : (type === 'overlay')
          ? null
          : <div style={style.schedulesText}>
            {timeStart.format('H:mm')} - {timeEnd.format('H:mm')}
            {note && <span> {note}</span>}
          </div>
      }
    </div>
  )
}
