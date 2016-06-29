defaults = require 'lodash/defaults'
Adt = require 'node_adt'
fs = require 'fs'
{ Meteor } = require 'meteor/meteor'

# coffeelint: disable=cyclomatic_complexity
module.exports = (options) ->
  options = defaults options,
    delete: true
    progressFactor: 1
    batchSize: 1000

  adt = new Adt()
  openAdt = Meteor.wrapAsync(adt.open, adt)

  table = openAdt(options.path, 'ISO-8859-1')
  findRecord = Meteor.wrapAsync(table.findRecord, table)

  options.progress.log("Adt: Parsing #{table.header.recordCount} records") if options.progress

  i = 0

  batch = [] if options.bulk or options.all

  for i in [0...table.header.recordCount]
    record = findRecord(i)

    record = options.iterator(record) if options.iterator

    if options.bulk or options.all
      batch.push(record) if record
      if batch.length >= options.batchSize and not options.all
        options.bulk(batch)
        batch = []

    if options.progress and i %% 10000 is 0
      options.progress.progress(Math.floor(i * options.progressFactor), table.header.recordCount)
      options.progress.log("Adt: Parsed #{i} records")


  if options.bulk and batch.length > 0 and not options.all
    options.bulk(batch)
    batch = []

  options.progress.log("Adt: Parsed #{i} records. Done.") if options.progress

  if options.all
    options.all(batch)
    batch = []

  options.progress.log('Adt: Closing table') if options.progress
  table.close()
  fs.unlinkSync(options.path) if options.delete

  return i
