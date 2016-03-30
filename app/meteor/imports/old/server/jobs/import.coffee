Meteor.startup ->
  @Jobs.Import.events.on 'error', (msg) ->
    return console.error('[Import] Job: Error', msg)

  @Jobs.Import.events.on 'jobLog', (msg) ->
    message = msg.params[2]
    return console.log('[Import] Job: ' + message)

  @Jobs.Import.startJobServer()
