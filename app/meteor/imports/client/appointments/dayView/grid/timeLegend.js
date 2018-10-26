import React from 'react'
import flatten from 'lodash/flatten'
import { timeSlots, formatter, isFullHour, isQuarterHour } from './timeSlots'
import { grayDisabled, darkGrayActive, darkGrayDisabled, background, unavailable } from '../../../layout/styles'
import { color, lightness } from 'kewler'


const timeLegendStyle = {
  color: grayDisabled,
  gridColumn: 'time',
}

const borderStyle = {
  gridColumnStart: 2,
  gridColumnEnd: 'end',
  borderTop: `1px solid ${color(unavailable, lightness(-3))}`,
  pointerEvents: 'none',
  zIndex: 1
}

const fullHourBorderStyle = {
  borderTop: `1px solid ${color(unavailable, lightness(-12))}`
}

const fullHourStyle = {
  color: `darken(${darkGrayActive}, 15%)`,
  fontWeight: 'bold'
}

const quarterHourStyle = {
  color: darkGrayDisabled
}

export const timeLegend = ({ slotSize }) => {
  const format = formatter(slotSize)

  return flatten(timeSlots(slotSize)
    .map((time, i, slots) => {
      let legendStyle = {
        ...timeLegendStyle,
        gridRow: time
      }

      let borderRowStyle = {
        ...borderStyle,
        gridRow: time
      }

      if (slotSize < 15 && isQuarterHour(time) || slotSize >= 60) {
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

        borderRowStyle = {
          ...borderRowStyle,
          ...fullHourBorderStyle
        }
      }

      return [
        <div
          key={time}
          id={time}
          style={legendStyle}>
          {format(time)}
        </div>,
        <div
          key={`b-${time}`}
          style={borderRowStyle}
        />
      ]
    })
  )
}
