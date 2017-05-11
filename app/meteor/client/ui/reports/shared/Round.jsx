export const Round = ({ number }) => {
  const rounded = number.toFixed(1)
  return <span>{rounded}</span>
}
