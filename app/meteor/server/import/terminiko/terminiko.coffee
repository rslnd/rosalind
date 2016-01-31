Meteor.startup ->
  Job.processJobs 'import', 'terminiko', (job, callback) ->
    job.log('Terminiko: Running')

    Import.Terminiko.upsertPatients(job)
    Import.Terminiko.upsertAppointments(job)

    job.done() and callback()
