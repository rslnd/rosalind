React = require 'react'
{ compose } = require 'react-komposer'
moment = require 'moment'
{ relativeTimeString } = require '/imports/util/time/format'

class Time extends React.Component
  render: ->
    <span>{ @props.time }</span>

composer = (props, onData) ->
  update = -> onData(null, { time: relativeTimeString(props.time) })
  handler = setInterval(update, 10000)
  update()
  cleanup = -> clearInterval(handler)

RelativeTime = compose(composer)(Time)

module.exports = { RelativeTime }
