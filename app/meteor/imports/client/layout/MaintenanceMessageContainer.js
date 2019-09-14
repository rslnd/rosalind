import React from 'react'
import { withTracker } from '../components/withTracker'
import { Settings } from '../../api/settings'

const SNOOZE_SECONDS = 60 * 3

const composer = (props) => {
  const enabled = Settings.get('maintenance.enabled')
  const title = Settings.get('maintenance.title')
  const message = Settings.get('maintenance.message')
  return { enabled, title, message }
}

const styleContainer = {
  position: 'fixed',
  zIndex: 2000,
  bottom: 0,
  width: '100%',
  minHeight: 60,
  pointerEvents: 'none',
  display: 'flex',
  justifyContent: 'center'
}

const styleMessage = {
  pointerEvents: 'auto'
}

const styleClose = {
  fontSize: '14px',
  top: -5,
  right: -15,
  opacity: 0.5
}

export class MaintenanceMessage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      snoozedAt: null
    }

    this.snooze = this.snooze.bind(this)
    this.isVisible = this.isVisible.bind(this)
  }

  snooze () {
    this.setState({
      snoozedAt: new Date()
    })
  }

  isVisible () {
    const snoozed = this.state.snoozedAt && ((new Date() - this.state.snoozedAt) / 1000 < SNOOZE_SECONDS)
    return this.props.enabled && !snoozed
  }

  render () {
    const { message, title } = this.props

    if (this.isVisible()) {
      return (
        <div style={styleContainer}>
          <div style={styleMessage} className='callout callout-warning alert-dismissable'>
            <button type='button' className='close' style={styleClose} onClick={this.snooze}>x</button>
            <h4>{title}</h4>
            <p>{message}</p>
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}

export const MaintenanceMessageContainer = withTracker(composer)(MaintenanceMessage)
