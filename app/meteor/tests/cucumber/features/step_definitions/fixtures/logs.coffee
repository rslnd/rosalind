reject = require 'lodash/reject'
some = require 'lodash/some'

module.exports =
  fetchLogs: ->
    logs = browser.log('browser')

    filterList = [
      'logged out by the server. Please log in again.'
      'failed: Error during WebSocket handshake: net::ERR_CONNECTION_RESET'
    ]

    if logs.value.length > 0
      filteredLogs = reject logs.value, (log) ->
        some filterList, (filter) ->
          log?.message.indexOf(filter) > 0

      if filteredLogs.length > 0
        console.log('[Browser]', filteredLogs)


  failOnError: ->
    lastError = browser.execute(-> window.lastError).value
    message = lastError and lastError.message
    expect(lastError).toBeNull(message)
    browser.execute(-> window.lastError = null)
