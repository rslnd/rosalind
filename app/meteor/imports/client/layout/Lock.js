import React from 'react'
import range from 'lodash/range'
import { ReactiveVar } from 'meteor/reactive-var'
import { withTracker } from '../components/withTracker'
import { gray, background } from '../layout/styles'
import { Icon } from '../components/Icon'
import { getSettings } from '../../api/clients/methods/getSettings'

const lockState = new ReactiveVar(null)
const pinState = new ReactiveVar('')

const setPin = (pin) => {
  pinState.set(pin)
}

export const lock = () => {
  console.log('[Lock] Locked screen')
  lockState.set(true)
  pinState.set('')
}

const unlock = () => {
  console.log('[Lock] Requested unlock')
  lockState.set(false)
  pinState.set('')
}

const composer = () => {
  const isLocked = lockState.get()
  const pin = pinState.get()

  const settings = getSettings()

  if (settings && settings.lockScreenPin) {
    const { lockScreenPin } = settings

    if (isLocked === null) {
      lock()
    }

    const attemptUnlock = (pin) => {
      if (pin === lockScreenPin) {
        unlock()
      }
    }

    return {
      pin,
      setPin,
      isLocked,
      unlock,
      attemptUnlock
    }
  } else {
    return {
      isLocked: false
    }
  }
}

const maxPinLength = 15

class LockScreen extends React.Component {
  constructor (props) {
    super(props)

    this.handleAddDigit = this.handleAddDigit.bind(this)
    this.handleRemoveDigit = this.handleRemoveDigit.bind(this)
  }

  handleAddDigit (digit) {
    if (this.props.pin.length > maxPinLength) {
      return
    }

    const pin = `${this.props.pin}${digit}`

    this.props.setPin(pin)
    this.props.attemptUnlock(pin)
  }

  handleRemoveDigit () {
    const pin = this.props.pin.substr(0, Math.max(0, this.props.pin.length - 1))

    this.props.setPin(pin)
    this.props.attemptUnlock(pin)
  }

  render () {
    if (!this.props.isLocked) {
      return null
    }

    return (
      <div style={lockScreenStyle} onClick={this.handleUnlock}>
        <Pin pin={this.props.pin} />
        <Keypad
          onAddDigit={this.handleAddDigit}
          onRemoveDigit={this.handleRemoveDigit}
        />
      </div>
    )
  }
}

export const lockScreenStyle = {
  zIndex: 1054,
  position: 'fixed',
  backgroundColor: '#3c8dbc',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
}

const Pin = ({ pin }) =>
  <div style={pinStyle}>
    {
      range(0, pin.length).map(i =>
        <span key={i} style={pinDotStyle} />
      )
    }
  </div>

const pinStyle = {
  textAlign: 'center',
  width: '100%',
  height: 40,
  minHeight: 40,
  maxHeight: 40,
  marginTop: 60,
  marginBottom: 20
}

const pinDotStyle = {
  display: 'inline-block',
  height: 14,
  width: 14,
  backgroundColor: background,
  borderRadius: '100%',
  margin: 14
}

const keypadLayout = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [null, 0, -1]
]

const Keypad = ({ onAddDigit, onRemoveDigit }) =>
  <div style={keypadStyle}>
    {
      keypadLayout.map((row, i) =>
        <div key={i} style={rowStyle}>
          {
            row.map((digit, j) =>
              <Digit
                key={j}
                digit={digit}
                onAddDigit={onAddDigit}
                onRemoveDigit={onRemoveDigit}
              />
            )
          }
        </div>
      )
    }
  </div>

const keypadStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}

const rowStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center'
}

const digitPositionStyle = {
  width: 80,
  height: 80,
  fontSize: '22px',
  textAlign: 'center',
  color: background,
  padding: 23,
  margin: 10
}

class Digit extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    const { digit } = this.props
    if (digit === -1) {
      this.props.onRemoveDigit()
    } else if (digit !== null) {
      this.props.onAddDigit(digit)
    }
  }

  render () {
    const { digit } = this.props
    const isDigit = digit !== null
    const isRemove = digit === -1

    const style = {
      ...digitPositionStyle,
      ...((isDigit && !isRemove && withBorderStyle) || {})
    }

    return (
      <div
        style={style}
        onClick={this.handleClick}>
        {
          isDigit &&
            <span>
              {
                isRemove
                  ? <Icon name='angle-left' />
                  : digit
              }
            </span>
        }
      </div>
    )
  }
}

const withBorderStyle = {
  border: `1px solid ${gray}`,
  borderRadius: '100%'
}

export const Lock = withTracker(composer)(LockScreen)
