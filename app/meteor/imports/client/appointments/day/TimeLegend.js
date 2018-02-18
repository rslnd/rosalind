import React from 'react'
import PropTypes from 'prop-types'
import { formatter, isFullHour, isQuarterHour } from '../dayView/grid/timeSlots'
import { grayDisabled, darkGrayActive, darkGrayDisabled } from '../../css/global'

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

export const TimeLegend = ({ slotSize, time }) => {
  const format = formatter(slotSize)

  let style = styles.timeLegend

  if (slotSize < 15 && isQuarterHour(time) || slotSize >= 60) {
    style = {
      ...styles,
      ...styles.quarterHour
    }
  }

  if (slotSize < 60 && isFullHour(time)) {
    style = {
      ...styles,
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
}

TimeLegend.propTypes = {
  slotSize: PropTypes.number.isRequired,
  time: PropTypes.string.isRequired
}
