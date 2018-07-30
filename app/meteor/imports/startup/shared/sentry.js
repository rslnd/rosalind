import RavenLogger from 'meteor/flowkey:raven'

let sentry = {}

export default ({ env }) => {
  if (process.env.NODE_ENV === 'production') {
    if (!env.SENTRY_DSN_URL_PUBLIC) {
      console.warn('[Sentry] Please set SENTRY_DSN_URL_PUBLIC')
    }

    sentry = new RavenLogger({
      publicDSN: env.SENTRY_DSN_URL_PUBLIC,
      privateDSN: env.SENTRY_DSN_URL_PRIVATE,
      shouldCatchConsoleError: true,
      trackUser: false
    }, {
      release: env.COMMIT_HASH
    })
  }
}

export { sentry }
