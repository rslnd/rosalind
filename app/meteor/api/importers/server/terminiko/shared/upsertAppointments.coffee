moment = require 'moment'
{ Meteor } = require 'meteor/meteor'
{ Appointments } = require 'api/appointments'
mdb = require '../../shared/mdb'
parseNewlines = require 'util/parseNewlines'
findPatientId = require './findPatientId'

module.exports = (job, resources) ->
  mdb
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

      { patientId, heuristic } = findPatientId({ job, record })

      tags = getResources({ key: 'U', record, resources })

      $set =
        external:
          terminiko:
            id: record.Kennummer.toString()
            note: parseNewlines(record.Info?.toString())
            timestamps:
              importedAt: moment().toDate()
              importedBy: job.data.userId
              externalUpdatedAt: externalUpdatedAt

        heuristic: heuristic
        tags: tags
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
  res = getResources(options)
  res and res[0]

getResources = (options) ->
  return unless options.record.Resources
  resourceIds = options.record.Resources.toString().split(';')
  resourceIds = _.filter(resourceIds, (r) -> r.indexOf(options.key) isnt -1)
  resourceIds.map (id) -> options.resources[id]
