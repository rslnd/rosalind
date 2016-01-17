fs = Meteor.npmRequire('fs')
Adt = Meteor.npmRequire('node_adt')

Meteor.startup ->
  Job.processJobs 'import', 'eoswinPatients', (job, callback) ->
    job.log('EoswinPatients: Running')

    path = job.data.path

    adt = new Adt()
    openAdt = Meteor.wrapAsync(adt.open, adt)

    table = openAdt(path, 'ISO-8859-1')
    findRecord = Meteor.wrapAsync(table.findRecord, table)

    job.log("EoswinPatients: Upserting #{table.header.recordCount} patients")

    i = 0
    for i in [0...table.header.recordCount]
      record = findRecord(i)
      job.progress(i, table.header.recordCount) if i %% 1000 is 0


    job.log("EoswinPatients: Upserted #{i} patients. Done.")

    fs.unlinkSync(path)
    table.close()

    job.done() and callback()
