import React from 'react'
import { relativeTimeString } from '../../util/time/format'

export class RelativeTime extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      tick: 0
    }

    this.tick = this.tick.bind(this)
  }

  componentDidMount () {
    this.setState({
      intervalId: setInterval(this.tick, 10000)
    })
  }

  componentWillUnmount () {
    clearInterval(this.state.intervalId)
  }

  tick () {
    this.setState({
      tick: this.state.tick + 1
    })
  }

  render () {
    return <span>{relativeTimeString(this.props.time)}</span>
  }
}
