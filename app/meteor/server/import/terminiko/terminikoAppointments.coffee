@Import ||= {}
@Import.Terminiko ||= {}

@Import.Terminiko.upsertAppointments = (job) ->
  Import.Mdb
    path: job.data.path
    table: 'Termine'
    progress: job
    iterator: (record) ->
      patient = Patients.findOne('external.terminiko.id': record.Patient_Id, fields: '_id') if record.Patient_Id

      operation =
        selector:
          'external.terminiko.id': parseInt(record.Kennummer)
        $set:
          external:
            terminiko:
              id: parseInt(record.Kennummer)
              note: record.Info
              timestamps:
                importedAt: moment().toDate()
                importedBy: job.data.userId
                externalUpdatedAt: moment(record.Datum_Bearbeitung).toDate()

          patientId: patient?._id
          start: moment(record.Datum_Beginn).toDate()
          end: moment(record.Datum_Beginn).toDate()

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
