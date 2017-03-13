import classnames from 'classnames'
import timeLegendStyle from './timeLegendStyle'
import { timeSlots, format, isFullHour, isQuarterHour } from './timeSlots'

export const timeLegend = () => (
  timeSlots
    .map((time) => {
      const classes = classnames({
        [ timeLegendStyle.fullHour ]: isFullHour(time),
        [ timeLegendStyle.quarterHour ]: isQuarterHour(time),
        [ timeLegendStyle.timeLegend ]: true
      })

      return (
        <span
          key={time}
          id={time}
          className={classes}
          style={{
            gridRow: time,
            gridColumn: 'time'
          }}>
          {format(time)}
        </span>
      )
    })
)
