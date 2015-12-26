if process.env.SENTRY_KEY?

  credentials =
    client: process.env.SENTRY_KEY.slice(0, 40) + process.env.SENTRY_KEY.slice(40+33)
    server: process.env.SENTRY_KEY

  RavenLogger.initialize credentials,
    trackUser: true
    patchGlobal: true
