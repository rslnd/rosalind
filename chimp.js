var browser = {
  name: process.env.BROWSER.split(':')[0],
  version: process.env.BROWSER.split(':')[1],
}

var os = {
  long: process.env.OS,
  short: {
    'Windows 10': 'WIN10',
    'Windows 8.1': 'WIN8',
    'Windows 8': 'WIN8',
    'Windows 7': 'VISTA',
    'Windows XP': 'XP'
  }[process.env.OS]
}

console.log('** OS:', process.env.OS)
console.log('** Browser:', browser.name, browser.version)
console.log('** Worker:', process.env.TRAVIS_JOB_NUMBER)

module.exports = {
  watch: false,

  path: 'app/meteor/tests/cucumber/features/',
  ddp: process.env.ROOT_URL,

  compiler: 'coffee:coffee-script/register',

  browser: browser.name.toLowerCase(),
  platform: os.short,

  name: process.env.SAUCE_NAME,
  host: process.env.SAUCE_HOST,
  port: process.env.SAUCE_PORT,
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,

  noSessionReuse: true,

  webdriverio: {
    desiredCapabilities: {
      browserName: browser.name,
      version: browser.version,
      platform: os.long,
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      name: process.env.SAUCE_NAME,
      build: process.env.TRAVIS_BUILD_NUMBER,
      public: true,
      after: function() {
        browser.end()
      }
    },
    services: ['sauce'],
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    host: process.env.SAUCE_HOST,
    port: process.env.SAUCE_PORT,
    waitforTimeout: 30000,
    waitforInterval: 250,
  }
}
