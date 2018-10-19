import RavenLogger from 'meteor/flowkey:raven'
import { Meteor } from 'meteor/meteor'

let sentryLogger = null

export default () => {
  if (process.env.NODE_ENV === 'production') {
    if (!Meteor.settings.public.SENTRY_DSN_URL_PUBLIC) {
      console.warn('[Sentry] Please set SENTRY_DSN_URL_PUBLIC')
    }

    sentryLogger = new RavenLogger({
      publicDSN: Meteor.settings.public.SENTRY_DSN_URL_PUBLIC,
      privateDSN: process.env.SENTRY_DSN_URL_PRIVATE,
      shouldCatchConsoleError: true,
      trackUser: false
    }, {
      release: Meteor.settings.public.COMMIT_HASH
    })
  }
}

const sentry = (exception, additionalData) => {
  if (sentryLogger) {
    sentryLogger.log(exception, additionalData)
  }
}

export { sentry }
