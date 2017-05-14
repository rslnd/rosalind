export const Round = ({ number, to, unit }) => {
  if (!number) {
    return null
  }

  let rounded
  if (to === 0) {
    rounded = Math.round(number)
  } else {
    rounded = number.toFixed(to || 1)
  }

  let prepend = null

  if (unit) {
    prepend = <small className="text-muted">{unit}&thinsp;</small>
  }
  
  return <span>{prepend}{rounded}</span>
}
