url = require('url')
locale = require('./global/localeSteps')

module.exports = ->
  @Given 'I am on the dashboard', ->
    browser.url(process.env.ROOT_URL)
    browser.pause(150)
    locale.setLocale()

  @When 'I navigate to \'$relativePath\'', (relativePath) ->
    browser.url(url.resolve(process.env.ROOT_URL, relativePath))
    locale.setLocale()
