import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import Login from './login'

const composer = (props, onData) => {
  const loggingIn = Meteor.loggingIn()
  onData(null, { loggingIn })
}

export const LoginContainer = composeWithTracker(composer)(Login)
