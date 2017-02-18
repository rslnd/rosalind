import once from 'lodash/once'
import { Meteor } from 'meteor/meteor'
import stub from './stub'
import websms from './websms'

let provider = stub

const isProduction = (
  Meteor.isServer &&
  Meteor.isProduction &&
  !Meteor.isDevelopment &&
  process.env.NODE_ENV === 'production'
)

const warning = once((p) => console.warn(`[Messages] channels/sms/providers: Using provider ${p} in production mode`))

if (isProduction) {
  provider = websms
  warning(provider.name)
} else {
  provider = stub
}

export default provider
