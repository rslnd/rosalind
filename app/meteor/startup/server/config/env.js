import { Env } from 'meteor/clinical:env'

export default () => {
  Env.allow({
    NODE_ENV: true,
    COMMIT_HASH: true,
    BUILD_NUMBER: true,
    CUSTOMER_NAME: true
  })
}
