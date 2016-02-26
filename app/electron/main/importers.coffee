module.exports =
  bdt: require('./import/bdt')
  terminiko: require('./import/terminiko')
  eoswin:
    patients: require('./import/eoswin/eoswinPatients')
    reports: require('./import/eoswin/eoswinReports')

  instances: {}

  start: (options) ->
    @instances.bdt = @bdt.watch(options)
    @instances.terminiko = @terminiko.start(options)
    @instances.eoswin =
      patients: @eoswin.patients.start(options)
      reports: @eoswin.reports.start(options)

  stop: ->
    @instances.bdt.close()
