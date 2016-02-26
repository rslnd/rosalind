Meteor.startup ->
  Job.processJobs 'import', 'eoswinReports', (job, callback) ->
    job.log('EoswinReports: Running')

    Import.Adt
      path: job.data.path
      progress: job
      all: (records) ->

        console.log(records)
    job.done() and callback()
