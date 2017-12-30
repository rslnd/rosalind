import React from 'react'
import { timeSlots, formatter, isFullHour, isQuarterHour } from './timeSlots'
import { grayDisabled, darkGrayActive, darkGrayDisabled } from '../../../css/global'

const styles = {
  timeLegend: {
    color: grayDisabled,
    gridColumn: 'time'
  },
  fullHour: {
    color: `darken(${darkGrayActive}, 15%)`,
    fontWeight: 'bold'
  },
  quarterHour: {
    color: darkGrayDisabled
  }
}

export const timeLegend = ({ slotSize }) => {
  const format = formatter(slotSize)

  return timeSlots(slotSize)
    .map((time, i, slots) => {
      let style = {
        ...styles.timeLegend,
        gridRow: time
      }

      if (isQuarterHour(time)) {
        style = {
          ...style,
          ...styles.quarterHour
        }
      }

      if (isFullHour(time)) {
        style = {
          ...style,
          ...styles.fullHour
        }
      }

      return (
        <span
          key={time}
          id={time}
          style={style}>
          {format(time)}
        </span>
      )
    })
}
