import { Meteor } from 'meteor/meteor'

export const BANNER = `


              .        .
      ,-. ,-. |  ,-. ,-|
      |   \`-. |  | | | |
      '   \`-' \`' ' ' \`-^


`

export default () => {
  const info = [
    process.env.CUSTOMER_NAME,
    process.env.TZ_CLIENT,
    Meteor.release,
    process.env.COMMIT_HASH,
    process.env.NODE_ENV,
    process.env.TEST,
    process.env.BUILD_NUMBER
  ]

  console.log(BANNER)
  console.log(info.filter((i) => i).map((i) => `     ${i}`).join('\n'))
  console.log('\n')
}
