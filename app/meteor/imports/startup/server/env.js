import { Env } from 'meteor/clinical:env'

export default () => {
  Env.allow({
    NODE_ENV: true,
    TZ_CLIENT: true,
    TEST: true,
    COMMIT_HASH: true,
    BUILD_NUMBER: true,
    CUSTOMER_NAME: true,
    SMOOCH_APP_ID: true,
    SENTRY_DSN_URL_PUBLIC: true
  })
}
