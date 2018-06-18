import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
moment = extendMoment(momentTz)
import includes from 'lodash/includes'
import { Meteor } from 'meteor/meteor'
import { Appointments } from '../../../../appointments'
import { Tags } from '../../../../tags'
import mdb from '../../shared/mdb'
import { parseNewlines } from './parseNewlines'
import findPatientId from './findPatientId'
import { upsertSchedules } from './upsertSchedules'
import { getResource, getResources } from './getResources'

module.exports = (job, resources) ->
  mdb
    path: job.data.path
    table: 'Termine'
    progress: job
    reverseParse: true
    iterator: (record) ->
      return unless record

      timezone = 'Europe/Vienna'

      # if includes([2, 3, 4, 6, 23], record.Status_Id)
      #   upsertSchedules({ record, resources, job })
      #   return

      if (not record.Patient_Id or record.Patient_Id < 1) and (not record.Info or record.Info.toString().length < 1)
        return

      if (not includes([1, 8], record.Status_Id))
        console.error('[Importers] terminiko: upsertAppointments: Status ID is not 1 or 8', record.Kennummer)
        return

      if (not record.Datum_Beginn or not record.Datum_Ende)
        console.error('[Importers] terminiko: upsertAppointments: Appointment has no start or end date', record.Kennummer)
        return

      start = moment.tz(record.Datum_Beginn, timezone)
      end = moment.tz(record.Datum_Ende, timezone)

      if (moment.range(start, end).diff('hours') > 20)
        console.error('[Importers] terminiko: upsertAppointments: Appointment duration is too long', record.Kennummer)
        return

      if (moment.range(start, end).diff('seconds') < 1)
        end = end.clone().add(5, 'minutes')

      externalUpdatedAt = moment.tz(record.Datum_Bearbeitung, timezone).toDate() if record.Datum_Bearbeitung

      { patientId, heuristic } = findPatientId({ job, record })

      tags = getResources({ key: 'U', record, resources })
      if (tags)
        tags = tags.map (tag) ->
          tag = Tags.findOne({ tag })
          if (tag)
            return tag._id


      $set =
        external:
          terminiko:
            id: record.Kennummer.toString()
            patientId: record.Patient_Id.toString()
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

      for i in [0...operations.length]
        operation = operations[i]
        Appointments.upsert(operation.selector, { $set: operation.$set })
