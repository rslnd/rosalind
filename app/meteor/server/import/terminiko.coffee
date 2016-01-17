Meteor.startup ->
  Job.processJobs 'import', 'terminiko', (job, callback) ->
    job.log('Terminiko: Running')

    Import.Mdb
      path: job.data.path
      table: 'Termine'
      progress: job
      iterator: (record) ->
        {}

    job.done() and callback()
