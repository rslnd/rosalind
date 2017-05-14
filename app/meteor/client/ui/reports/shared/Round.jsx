export const Round = ({ number, to }) => {
  if (!number) {
    return null
  }

  let rounded
  if (to === 0) {
    rounded = Math.round(number)
  } else {
    rounded = number.toFixed(to || 1)
  }
  
  return <span>{rounded}</span>
}
