export const Round = ({ number }) => {
  if (!number) {
    return null
  }

  const rounded = number.toFixed(1)
  return <span>{rounded}</span>
}
