Meteor.startup ->
  Job.processJobs 'import', 'eoswinPatients', (job, callback) ->
    job.log('EoswinPatients: Running')

    Import.Adt
      path: job.data.path
      progress: job
      iterator: (record) ->
        {}

    job.done() and callback()
