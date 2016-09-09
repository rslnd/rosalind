import { Env } from 'meteor/clinical:env'

export default () => {
  Env.allow({
    NODE_ENV: true,
    TEST: true,
    COMMIT_HASH: true,
    BUILD_NUMBER: true,
    CUSTOMER_NAME: true,
    SMOOCH_APP_TOKEN: true
  })
}
