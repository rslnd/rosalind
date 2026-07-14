import moment from 'moment-timezone'
import momentDurationFormat from 'moment-duration-format'

// Register the plugin against the moment-timezone instance. The bare side-effect
// import does not self-register in this setup, so call it explicitly here where
// durationFormat is actually used (previously this happened only via reports/Week.js).
momentDurationFormat(moment)

export const durationFormat = (decimal, unit = 'hours') => (
  (decimal < 0)
    ? '0:00'
    : moment.duration(decimal, unit).format('h:mm', { trim: false })
)
