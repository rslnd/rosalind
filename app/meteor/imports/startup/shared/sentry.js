import { Meteor } from 'meteor/meteor'
import RavenLogger from 'meteor/flowkey:raven'

const env = Meteor.isClient
  ? require('meteor/clinical:env').process.env
  : process.env

if (!env.SENTRY_DSN_URL_PUBLIC) {
  console.warn('[Sentry] Please set SENTRY_DSN_URL_PUBLIC')
}

export const sentry = new RavenLogger({
  publicDSN: env.SENTRY_DSN_URL_PUBLIC,
  privateDSN: env.SENTRY_DSN_URL_PRIVATE,
  shouldCatchConsoleError: true,
  trackUser: false
}, {
  release: env.COMMIT_HASH
})
