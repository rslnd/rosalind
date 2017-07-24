import React from 'react'
import moment from 'moment-timezone'
import { label } from './timeSlots'

const style = {
  backgroundColor: 'rgb(226, 214, 227)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  pointerEvents: 'none',
  textAlign: 'center'
}

export const overrideOverlay = ({ isOverriding, overrideAssigneeId, start, end }) => {
  if (start) {
    const overrideStart = moment(start)
    const overrideEnd = moment(end).add(1, 'second')

    return (
      <div
        key='override-start'
        style={{
          ...style,
          gridRowStart: label(overrideStart),
          gridRowEnd: label(overrideEnd),
          gridColumn: `assignee-${overrideAssigneeId}`
        }}>
        <div>{overrideStart.format('H:mm')}</div>
        <div>{overrideEnd.format('H:mm')}</div>
      </div>
    )
  } else {
    return null
  }
}
