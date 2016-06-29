{ parseResources, upsertPatients, upsertAppointments } = require './shared'

module.exports = (job, callback) ->
  job.log('Terminiko: Running')

  resources = parseResources(job)
  upsertPatients(job, resources)
  upsertAppointments(job, resources)

  job.done() and callback()
