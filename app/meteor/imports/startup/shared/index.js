import { Meteor } from 'meteor/meteor'
import sentry from './sentry'

const env = Meteor.isClient
  ? require('meteor/clinical:env').process.env
  : process.env

export default () => {
  sentry({ env })
}
