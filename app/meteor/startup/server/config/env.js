import { Env } from 'meteor/clinical:env'

export default () => {
  Env.allow({
    COMMIT_HASH: true,
    BUILD_NUMBER: true,
    CUSTOMER_NAME: true
  })
}
