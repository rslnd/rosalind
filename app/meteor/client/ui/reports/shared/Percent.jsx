import { Nil } from './Nil'

export const formatPercentage = (props) => {
  const percentage = props.part / props.of * 100

  if (percentage < 5) {
    return percentage.toFixed(1)
  } else {
    return Math.round(percentage)
  }
}

export const Percent = (props) => {
  const {
    part,
    parenAbsolute,
    slash,
    bigPercent,
    percentageStyle,
    noBr
  } = props

  if (!part) { return <Nil /> }
  const style = { ...props.style, textAlign: 'right' }

  let formattedPart = Math.round(part)
  if (parenAbsolute) {
    formattedPart = `(${part})`
  }
  if (slash) {
    formattedPart = `${part} / ${Math.round(props.of)}`
  }

  if (props.of) {
    const formattedPercentage = `${formatPercentage({ part, of: props.of })}%`

    let upper, lower

    if (bigPercent) {
      upper = formattedPercentage
      lower = formattedPart
    } else {
      upper = formattedPart
      lower = formattedPercentage
    }

    return (
      <span style={style}>
        {upper}
        <small className="text-muted" style={percentageStyle}>
          {!noBr && <br />}
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
