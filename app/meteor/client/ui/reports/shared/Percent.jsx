import { Nil } from './Nil'

export const Percent = (props) => {
  if (!props.part) { return <Nil /> }
  const style = { ...props.style, textAlign: 'right' }

  let formattedPart = Math.round(props.part)
  if (props.parenAbsolute) {
    formattedPart = `(${props.part})`
  }
  if (props.slash) {
    formattedPart = `${props.part} / ${Math.round(props.of)}`
  }

  if (props.of) {
    const percentage = props.part / props.of * 100
    let formattedPercentage

    if (percentage < 5) {
      formattedPercentage = percentage.toFixed(1)
    } else {
      formattedPercentage = Math.floor(percentage)
    }

    formattedPercentage = `${formattedPercentage}%`

    let upper, lower

    if (props.bigPercent) {
      upper = formattedPercentage
      lower = formattedPart
    } else {
      upper = formattedPart
      lower = formattedPercentage
    }

    return (
      <span style={style}>
        {upper}
        <small className="text-muted" style={props.percentageStyle}>
          {!props.noBr && <br />}
          {lower}
        </small>
      </span>
    )
  } else {
    return (
      <span style={style}>
        {upper}
      </span>
    )
  }
}
