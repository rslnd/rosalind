import React from 'react'
import moment from 'moment-timezone'
import overrideOverlayStyle from './overrideOverlayStyle'
import { label } from './timeSlots'

export const overrideOverlay = ({ isOverriding, overrideAssigneeId, start, end }) => {
  if (start) {
    const overrideStart = moment(start)
    const overrideEnd = moment(end).add(1, 'second')

    return (
      <div
        key='override-start'
        className={overrideOverlayStyle.overrideOverlay}
        style={{
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
