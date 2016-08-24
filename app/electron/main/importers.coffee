module.exports =
  bdt: require './import/bdt'
  terminiko: require './import/terminiko'

  instances: {}

  start: (options) ->
    @instances.bdt = @bdt.watch(options)
    @instances.terminiko = @terminiko.start(options)

  stop: ->
    @instances.bdt?.close()
