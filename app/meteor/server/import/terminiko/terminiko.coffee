Meteor.startup ->
  Job.processJobs 'import', 'terminiko', (job, callback) ->
    job.log('Terminiko: Running')

    resources = {}

    Import.Terminiko.parseResources(job, resources)
    Import.Terminiko.upsertPatients(job, resources)
    Import.Terminiko.upsertAppointments(job, resources)

    job.done() and callback()
