import { conditionalFloat, integer } from 'util/format'

export const Round = ({ number, to, unit }) => {
  if (!number) {
    return null
  }

  let prepend = null
  let rounded = conditionalFloat(number)

  if (to === 0) {
    rounded = integer(number)
  }

  if (unit) {
    prepend = <small className="text-muted">{unit}&thinsp;</small>
  }
  
  return <span>{prepend}{rounded}</span>
}
