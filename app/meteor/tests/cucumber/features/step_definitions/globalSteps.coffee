locale = require('./fixtures/locale')
database = require('./fixtures/database')
user = require('./fixtures/user')

module.exports = ->
  failOnError = ->
    lastError = browser.execute(-> window.lastError).value
    message = lastError and lastError.message
    expect(lastError).toBeNull(message)
    browser.execute(-> window.lastError = null)

  fetchLogs = ->
    logs = browser.log('browser')
    console.log('[Browser]', logs.value) if logs.value.length > 0

  @Before ->
    browser.url(process.env.ROOT_URL)
    browser.windowHandleMaximize()
    browser.timeouts('script', 30 * 1000)
    browser.timeouts('implicit', 30 * 1000)
    browser.timeouts('page load', 30 * 1000)
    browser.waitForExist('#loaded')
    user.logout()
    database.reset()
    locale.reset()
    failOnError()
    fetchLogs()

  @After ->
    fetchLogs()
    failOnError()
    user.logout()
    database.reset()
    locale.reset()
