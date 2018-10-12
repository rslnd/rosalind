const publicEnvVars = [
  'CUSTOMER_NAME',
  'TZ_CLIENT',
  'COMMIT_HASH',
  'BUILD_NUMBER',
  'SMOOCH_APP_ID',
  'SENTRY_DSN_URL_PUBLIC'
]

const envToJSON = env => {
  const publicSettings = Object.keys(env)
    .filter(k => publicEnvVars.includes(k))
    .reduce((acc, k) => ({
      ...acc,
      [k]: env[k]
    }), {})

  if (Object.keys(publicSettings).length === 0) {
    throw new Error('Did not find any public settings in the environment')
  }

  return JSON.stringify({ public: publicSettings })
}

// Don't eagerly load this file in Meteor <1.6
if (!global.Meteor) {
  console.log(envToJSON(process.env))
}
