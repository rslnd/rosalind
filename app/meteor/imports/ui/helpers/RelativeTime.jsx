import React from 'react'
import { compose } from 'react-komposer'
import moment from 'moment'
import { relativeTimeString } from '/imports/util/time/format'

const Time = ({ time }) => (<span>{ time }</span>)

const composer = (props, onData) => {
  const update = () => onData(null, { time: relativeTimeString(props.time) })
  const handler = setInterval(update, 10000)
  const cleanup = () => clearInterval(handler)

  update()
  return cleanup
}

const RelativeTime = compose(composer)(Time)

export { RelativeTime }
