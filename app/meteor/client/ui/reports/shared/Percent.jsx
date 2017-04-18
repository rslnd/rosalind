import { Nil } from './Nil'

export const Percent = (props) => {
  if (!props.part) { return <Nil /> }
  const style = { ...props.style, textAlign: 'right' }

  let formattedPart = props.part
  if (props.parenAbsolute) {
    formattedPart = `(${props.part})`
  }

  if (props.of) {
    const percentage = props.part / props.of * 100
    let formattedPercentage

    if (percentage < 5) {
      formattedPercentage = percentage.toFixed(1)
    } else {
      formattedPercentage = Math.floor(percentage)
    }

    return (
      <span style={style}>
        {formattedPart}
        {
          props.of &&
            <small className="text-muted" style={props.percentageStyle}>
              {!props.noBr && <br />}
              {formattedPercentage}%
            </small>
        }
      </span>
    )
  } else {
    return (
      <span style={style}>
        {formattedPart}
      </span>
    )
  }
}
