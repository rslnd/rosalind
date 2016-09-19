moment = require 'moment'
includes = require 'lodash/includes'
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
      return unless record
      return if (not record.PatientId or record.PatientId < 1) and (not record.Info or record.Info.toString().length < 1)

      # TODO: Implement parsing schedules
      return if includes([2, 3, 4, 6, 23], record.Status_Id)

      return if (not includes([1, 8], record.Status_Id))

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

      $set.heuristic = heuristic if heuristic
      $set.tags = tags if tags and tags.length
      $set.patientId = patientId if patientId
      $set.start = start.toDate() if start
      $set.end = end.toDate() if end
      $set.privateAppointment = record.Status_Id is 8
      $set = _.extend $set,
        getResource({ key: 'D', record, resources })

      $set.removed = true if record.Anwesend is 254
      $set.canceled = true if record.Anwesend is 3
      $set.admitted = true if record.Anwesend is 1
      $set.treated = true if record.Anwesend is 2
      $set.treated = true if $set.admitted and moment.range($set.start, moment()).diff('hours') > 4

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
