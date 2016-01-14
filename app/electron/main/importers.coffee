module.exports =
  bdt: require('./import/bdt')
  terminiko: require('./import/terminiko')
  eoswin:
    patients: require('./import/eoswin/eoswinPatients')

  instances: {}

  start: (options) ->
    @instances.bdt = @bdt.watch(options)
    @instances.terminiko = @terminiko.start(options)
    @instances.eoswin =
      patients: @eoswin.patients.start(options)

  stop: ->
    @instances.bdt.close()
