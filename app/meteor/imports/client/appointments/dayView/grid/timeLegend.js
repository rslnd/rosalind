import React from 'react'
import { timeSlots, format, isFullHour, isQuarterHour } from './timeSlots'
import { grayDisabled, darkGrayActive, darkGrayDisabled } from '../../../css/global'

const styles = {
  timeLegend: {
    color: grayDisabled
  },
  fullHour: {
    color: `darken(${darkGrayActive}, 15%)`,
    fontWeight: 'bold'
  },
  quarterHour: {
    color: darkGrayDisabled
  }
}

export const timeLegend = () => (
  timeSlots
    .map((time) => {
      let style = {
        ...styles.timeLegend,
        gridColumn: 'time',
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
)
