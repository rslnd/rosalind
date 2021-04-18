import once from 'lodash/once'
import { Meteor } from 'meteor/meteor'
import stub from './stub'
import websms from './websms'
import fxpsms from './fxpsms'
import { Settings } from '../../../../../settings'

const providers = {
  stub, websms, fxpsms
}

let provider = stub

const isProduction = (
  Meteor.isServer &&
  Meteor.isProduction &&
  !Meteor.isDevelopment &&
  process.env.NODE_ENV === 'production'
)

const warning = once((p) => console.warn(`[Messages] channels/sms/providers: Using provider ${p} in production mode`))

if (isProduction) {
  provider = providers[Settings.get('messages.sms.provider') || 'stub']
  warning(provider.name)
} else {
  provider = stub
}

export default provider
