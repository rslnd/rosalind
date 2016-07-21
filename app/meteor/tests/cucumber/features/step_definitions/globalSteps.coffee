locale = require './fixtures/locale'
database = require './fixtures/database'
user = require './fixtures/user'
logs = require './fixtures/logs'

module.exports = ->
  @Before ->
    browser.windowHandleMaximize()
    browser.timeouts('script', 30 * 1000)
    browser.timeouts('implicit', 30 * 1000)
    browser.timeouts('page load', 30 * 1000)
    browser.waitForExist('#loaded')
    user.logout()
    database.reset()
    locale.reset()
    logs.failOnError()
    logs.fetchLogs()

  @After ->
    logs.fetchLogs()
    logs.failOnError()
    user.logout()
    database.reset()
    locale.reset()
