@Import ||= {}
@Import.Terminiko ||= {}

@Import.Terminiko.upsertAppointments = (job, resources) ->
  Import.Mdb
    path: job.data.path
    table: 'Termine'
    progress: job
    reverseParse: true
    iterator: (record) ->
      return if record.PatientId < 1 and record.Info?.toString().length < 1

      start = moment(record.Datum_Beginn) if record.Datum_Beginn
      end = moment(record.Datum_Ende) if record.Datum_Ende
      return if moment().range(start, end).diff('hours') > 4
      return if moment().range(start, end).diff('seconds') < 1

      externalUpdatedAt = moment(record.Datum_Bearbeitung).toDate() if record.Datum_Bearbeitung

      { patientId, heuristic } = Import.Terminiko.findPatientId({ job, record })

      $set =
        external:
          terminiko:
            id: record.Kennummer.toString()
            note: Helpers.parseNewlines(record.Info?.toString())
            timestamps:
              importedAt: moment().toDate()
              importedBy: job.data.userId
              externalUpdatedAt: externalUpdatedAt

        heuristic: heuristic
        patientId: patientId
        start: start?.toDate()
        end: end?.toDate()
        privateAppointment: record.Info?.toString().match(/(privat|botox)/i)? or record.Status_Id is 8

      $set = _.extend $set,
        getResource({ key: 'D', record, resources })


      operation =
        selector:
          'external.terminiko.id': record.Kennummer.toString()
        $set: $set
    bulk: (operations) ->
      bulk = Appointments.rawCollection().initializeUnorderedBulkOp()

      for i in [0...operations.length]
        operation = operations[i]
        bulk
          .find(operation.selector)
          .upsert()
          .updateOne($set: operation.$set)

      if Meteor.wrapAsync(bulk.execute, bulk)().ok is not 1
        job.log("Terminiko: upsertAppointments: Bulk execute error: #{JSON.stringify(d)}")
        job.fail()

getResource = (options) ->
  return unless options.record.Resources
  resourceIds = options.record.Resources.toString().split(';')
  resourceId = _.find(resourceIds, (r) -> r.indexOf(options.key) isnt -1)
  options.resources[resourceId] if resourceId
