@Import ||= {}
@Import.Terminiko ||= {}

@Import.Terminiko.upsertAppointments = (job) ->
  Import.Mdb
    path: job.data.path
    table: 'Termine'
    progress: job
    iterator: (record) ->
      if record.Patient_Id and record.Patient_Id > 0
        patient = Patients.findOne
          'external.terminiko.id': record.Patient_Id.toString()
        patientId = new MongoInternals.NpmModule.ObjectID(patient._id._str) if patient

      operation =
        selector:
          'external.terminiko.id': record.Kennummer.toString()
        $set:
          external:
            terminiko:
              id: record.Kennummer.toString()
              note: record.Info
              timestamps:
                importedAt: moment().toDate()
                importedBy: job.data.userId
                externalUpdatedAt: moment(record.Datum_Bearbeitung).toDate()

          patientId: patientId
          start: moment(record.Datum_Beginn).toDate()
          end: moment(record.Datum_Ende).toDate()

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
