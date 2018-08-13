import React from 'react'
import { getSettings } from '../../api/clients/methods/getSettings'
import { lockScreenStyle } from './Lock'
import { withTracker } from '../components/withTracker'

const composer = props => {
  const settings = getSettings()
  if (settings) {
    return {
      isSignpad: settings.isSignpad
    }
  } else {
    return {
      isSignpad: false
    }
  }
}

const Screen = ({ isSignpad }) =>
  isSignpad
  ? (
    <div style={lockScreenStyle}>
      is Signpad
    </div>
  ) : null

export const SignPad = withTracker(composer)(Screen)
