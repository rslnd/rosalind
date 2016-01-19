@Import ||= {}

Adt = Meteor.npmRequire('node_adt')
fs = Meteor.npmRequire('fs')

@Import.Adt = (options) ->
  options = _.defaults options,
    delete: true

  adt = new Adt()
  openAdt = Meteor.wrapAsync(adt.open, adt)

  table = openAdt(options.path, 'ISO-8859-1')
  findRecord = Meteor.wrapAsync(table.findRecord, table)

  options.progress.log("Adt: Parsing #{table.header.recordCount} records") if options.progress

  if options.iterator
    i = 0

    batch = [] if options.bulkInsert

    for i in [0...table.header.recordCount]
      record = findRecord(i)

      record = options.iterator(record)

      if options.bulkInsert
        batch.push(record) if record
        if batch.length >= 1000
          options.bulkInsert(batch)
          batch = []

      if options.progress and i %% 10000 is 0
        options.progress.progress(i, table.header.recordCount)
        options.progress.log("Adt: Parsed #{i} records")


  if options.bulkInsert
    options.bulkInsert(batch)
    batch = []

  options.progress.log("Adt: Parsed #{i} records. Done.") if options.progress

  table.close()
  fs.unlinkSync(options.path) if options.delete

  return i
