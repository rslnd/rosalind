import { Nil } from './Nil'
import { percentage, integer } from 'util/format'

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

  let formattedPart = integer(part)

  if (parenAbsolute) {
    formattedPart = `(${formattedPart})`
  }

  if (slash) {
    formattedPart = `${formattedPart} / ${integer(props.of)}`
  }

  if (props.of) {
    const formattedPercentage = percentage({ part, of: props.of })

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
