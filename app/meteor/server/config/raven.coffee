if process.env.SENTRY_KEY?

  credentials =
    client: process.env.SENTRY_KEY.replace(/\:\w+/, '')
    server: process.env.SENTRY_KEY

  RavenLogger.initialize credentials,
    trackUser: true
    patchGlobal: true
