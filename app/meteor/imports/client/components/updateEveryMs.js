import React from 'react'

class Ticker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ticks: 0
    }

    this.onTick = this.onTick.bind(this)
  }

  onTick () {
    this.setState({
      ticks: this.state.ticks + 1
    })

    if (this.props.maxTicks && this.state.ticks >= this.props.maxTicks) {
      clearInterval(this.intervalId)
    }
  }

  componentDidMount () {
    this.intervalId = setInterval(this.onTick, this.props.ms)
  }

  componentWillUnmount () {
    clearInterval(this.intervalId)
  }

  render () {
    const { Component, childProps } = this.props

    return <Component
      {...childProps}
      ticks={this.state.ticks}
      isTimerRunning={!!this.intervalId}
    />
  }
}

export const updateEveryMs = ({ maxTicks, ms = 1000 } = {}) => Component => props =>
  <Ticker
    maxTicks={maxTicks}
    ms={ms}
    Component={Component}
    childProps={props}
  />
