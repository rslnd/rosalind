Meteor.startup ->
  Job.processJobs 'import', 'terminiko', (job, callback) ->
    job.log('Terminiko: Running')

    upsertPatients(job)

    job.done() and callback()

upsertPatients = (job) ->
  Import.Mdb
    path: job.data.path
    table: 'Patienten'
    progress: job
    iterator: (record) ->
      operation =
        selector:
          'external.eoswin.id': parseInt(record.pat_id_a)
        $set:
          'external.terminiko.id': parseInt(record.Kennummer)

    bulk: (records) ->
      bulk = Patients.rawCollection().initializeUnorderedBulkOp()

      job.log("Terminiko: upsertPatients: Bulk upserting #{records.length} records")

      for i in [0...records.length]
        bulk
          .find(records[i].selector)
          .updateOne($set: records[i].$set)

      if Meteor.wrapAsync(bulk.execute, bulk)().ok is not 1
        job.log("Terminiko: upsertPatients: Bulk execute error: #{JSON.stringify(d)}")
        job.fail()
