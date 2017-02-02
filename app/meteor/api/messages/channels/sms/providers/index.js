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

if (isProduction) {
  provider = websms
} else {
  provider = stub
}

export default provider
