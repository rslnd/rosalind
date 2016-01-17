@Jobs.Import.events.on 'error', (msg) ->
  return Winston.error('[Import] Job: Error', msg)

@Jobs.Import.events.on 'jobLog', (msg) ->
  message = msg.params[2]
  return Winston.info('[Import] Job: ' + message)


Meteor.startup ->
  @Jobs.Import.startJobServer()
