browser = process.env.BROWSER || 'chrome:27.0'
browserName = browser.split(':')[0]
browserVersion = browser.split(':')[1]

module.exports = {
  watch: false,

  path: 'app/meteor/tests/cucumber/features/',
  ddp: process.env.ROOT_URL,

  compiler: 'coffee:coffee-script/register',

  webdriverio: {
    desiredCapabilities: {
      browserName: browserName,
      version: browserVersion,
      platform: process.env.OS || 'Windows 7',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      name: process.env.SAUCE_NAME,
      build: process.env.TRAVIS_BUILD_NUMBER
    },
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    host: process.env.SAUCE_HOST,
    port: process.env.SAUCE_PORT
  }
}
