module.exports =
  fetchLogs: ->
    logs = browser.log('browser')

    filterList = [
      'logged out by the server. Please log in again.'
      'failed: Error during WebSocket handshake: net::ERR_CONNECTION_RESET'
      '[HMR] connected'
      'Download the React DevTools'
      '[Users] Logged'
      '[Users] Login failed'
      'Error: User not found [403]'
      '[Timesheets] Start tracking'
      '[Timesheets] Stop tracking'
    ]

    if logs.value.length > 0

      filteredLogs = logs.value.filter (log) ->
        keep = true
        filterList.forEach (filter) ->
          if (log and log.message and log.message.indexOf(filter) > 0)
            keep = false

        return keep

      if filteredLogs.length > 0
        console.log('[Browser]', filteredLogs)


  failOnError: ->
    lastError = browser.execute(-> window.lastError).value
    message = lastError and lastError.message
    expect(lastError).toBeNull(message)
    browser.execute(-> window.lastError = null)
