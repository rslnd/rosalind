import React from 'react'
import flatten from 'lodash/flatten'
import { timeSlots, formatter, isFullHour, isQuarterHour } from './timeSlots'
import { grayDisabled, darkGrayActive, darkGrayDisabled } from '../../../layout/styles'

const timeLegendStyle = {
  color: grayDisabled,
  gridColumn: 'time'
}

const fullHourStyle = {
  color: `darken(${darkGrayActive}, 15%)`,
  fontWeight: 'bold'
}

const quarterHourStyle = {
  color: darkGrayDisabled
}

export const timeLegend = ({ slotSize, scheduleOffset, atMinutes }) => {
  const format = formatter(slotSize)

  return flatten(timeSlots(slotSize, scheduleOffset, atMinutes)
    .map((time, i, slots) => {
      let legendStyle = {
        ...timeLegendStyle,
        gridRow: time
      }

      if ((slotSize < 15) && (isQuarterHour(time) || slotSize >= 60)) {
        legendStyle = {
          ...legendStyle,
          ...quarterHourStyle
        }
      }

      if (slotSize < 60 && isFullHour(time)) {
        legendStyle = {
          ...legendStyle,
          ...fullHourStyle
        }
      }

      return <div
        key={time}
        id={time}
        style={legendStyle}>
        {format(time)}
      </div>
    })
  )
}
