import { Meteor } from 'meteor/meteor'

export const BANNER = `
              .        .
      ,-. ,-. |  ,-. ,-|
      |   \`-. |  | | | |
      '   \`-' \`' ' ' \`-'
`

export default () => {
  const id = (i) => i

  const info = [
    process.env.CUSTOMER_NAME,
    [
      Meteor.release,
      process.env.NODE_ENV,
      process.env.TZ_CLIENT
    ].filter(id).join(' '),
    [
      (process.env.TEST && 'TEST'),
      process.env.BUILD_NUMBER,
      process.env.COMMIT_HASH
    ].filter(id).join(' ')
  ]

  // Clear screen
  if (process.env.NODE_ENV === 'development' && !process.env.CI) {
    console.log('\x1Bc')
  }

  console.log(BANNER)
  console.log(info
    .filter(id)
    .filter((s) => s.length > 0)
    .map((i) => `     ${i}`)
    .join('\n'))
  console.log('\n')
}
