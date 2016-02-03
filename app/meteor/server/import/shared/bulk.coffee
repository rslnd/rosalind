@Import ||= {}

@Import.Bulk = {}

@Import.Bulk.upsert = (options) ->

  collection = options.mongodb.collection
  selectorKey = options.mongodb.selector

  if options.mongodb
    mongodbBulk = options.mongodb.collection.rawCollection().initializeUnorderedBulkOp()

  for i in [0...options.records.length]
    record = options.records[i]
    selector = {}
    selector[selectorKey] = record[selectorKey]

    mongodbBulk
      .find(selector)
      .upsert()
      .update($set: record)

  execute = Meteor.wrapAsync(mongodbBulk.execute, mongodbBulk)
  execute = execute()

  unless execute.isOk()
    Winston.error("[Import] Mongodb Bulk Error: #{JSON.stringify(execute)}")
