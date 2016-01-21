locale = require('./global/localeSteps')

module.exports = ->
  failOnError = ->
    lastError = browser.execute(-> window.lastError).value
    message = lastError and lastError.message
    expect(lastError).toBeNull(message)
    browser.execute(-> window.lastError = null)

  @Before ->
    browser.url(process.env.ROOT_URL)
    browser.windowHandleMaximize()
    browser.timeoutsImplicitWait(3 * 1000)
    browser.waitForExist('#loaded')
    server.call('logout')
    server.call('fixtures/resetDatabase')
    locale.setLocale()

  @Before failOnError
  @After failOnError

  @After ->
    server.call('logout')
    server.call('fixtures/resetDatabase')
    locale.setLocale()
