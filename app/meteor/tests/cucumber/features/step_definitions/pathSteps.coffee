url = require('url')

module.exports = ->
  @Before ->
    browser.windowHandleMaximize()
    browser.url(process.env.ROOT_URL)
    browser.execute ->
      TAPi18n.setLanguage('en')
      moment.locale('en-US')

  @Given 'I am on the dashboard', ->
    browser.url(process.env.ROOT_URL)

  @When 'I navigate to \'$relativePath\'', (relativePath) ->
    browser.url(url.resolve(process.env.ROOT_URL, relativePath))
