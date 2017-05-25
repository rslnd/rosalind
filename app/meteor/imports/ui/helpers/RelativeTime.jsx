import React from 'react'
import { compose } from 'react-komposer'
import { relativeTimeString } from 'util/time/format'

const Time = ({ time }) => {
  return <span>{time}</span>
}

const composer = (props, onData) => {
  const update = () => onData(null, { time: relativeTimeString(props.time) })
  const handler = setInterval(update, 10000)
  update()
  const cleanup = () => clearInterval(handler)
  return cleanup
}

const RelativeTime = compose(composer)(Time)

export { RelativeTime }
