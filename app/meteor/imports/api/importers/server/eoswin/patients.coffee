moment = require 'moment'
_ = require 'lodash'
{ dateToDay } = require '/imports/util/day'
adt = require '../shared/adt'
bulk = require '../shared/bulk'
{ Patients } = require '/imports/api/patients'

parseContacts = (row) ->
  contacts = [
    { channel: 'Phone', value: row.Telefon1 }
    { channel: 'Phone', value: row.Telefon2 }
    { channel: 'Email', value: row.EMail }
    { channel: 'Phone', note: 'Fax', value: row.Fax }
  ]

  noContact = [
    'keine nr.', 'keine', 'nein', 'k nr', 'keine nummer',
    'keine vorhanden', 'keine nr', 'k tel', 'k,nr',
    'k tel', 'k a', 'keines', 'kein tel', 'kein telefon'
    'hat keines', 'hat keine', 'kein', 'keinhe', 'keine tele',
    'hat nicht', 'kein nr',
    'keine mailadresse', 'kein mailadresse',
    'no', '#', ',', '-'
  ]

  contacts = _.chain(contacts)
    .filter (c) -> c.value.length > 4
    .map (c, index) ->
      if c.value and _.includes(noContact, c.value.toLowerCase().split('.').join(' ').replace(/\s\s+/g, ' ').trim())
        return null
      else if c.value and c.value.indexOf('@') > 0 and c.value.indexOf('.') > 0
        return { value: c.value, channel: 'Email', order: index + 1 }
      else if c.value.match(/[0-9]/)
        c.order = index + 1
        return c
      else
        return { value: c.value, channel: 'Other', order: index + 1 }
    .filter (c) -> c?
    .value()

parseCoutry = (code) ->
  if code and code.length > 0
    switch code
      when 'A' then 'AT'
      when 'D' then 'DE'
      when 'DD' then 'DE'
      when 'H' then 'HU'
      when 'GBS' then 'GB'
      when 'E' then 'ES'
      when 'CH' then 'CH'
      else console.warn('[Import] EoswinPatiens: Unmapped country code', code)

parseDate = (dateString) ->
  if dateString and dateString isnt '00000000'
    moment(dateString, 'YYYYMMDD').toDate()

parseTime = (dateString, timeString) ->
  if dateString and dateString isnt '00000000'
    moment(dateString + timeString, 'YYYYMMDDHHMM').toDate()


parseTitlePrepend = (title) ->
  if title and title.length > 0 and titlePrepend.indexOf('.') is -1
    title
      .split('Dr').join('Dr.')
      .split('Mag').join('Mag.')
      .split('Hr.').join('')
      .split('Fr.').join('')
      .split('Herr').join('')
      .split('Frau').join('')

parseGender = (gender) ->
  gender
    .replace('W', 'Female')
    .replace('M', 'Male')

parseNote = (row) ->
  note = []
  note.push(row.Bemerkung) if row.Bemerkung.length > 0
  note.push(row.Bemerkung2) if row.Bemerkung2.length > 0
  note.join('\n\n')

module.exports = (job, callback) ->
  job.log('EoswinPatients: Running')

  adt
    path: job.data.path
    progress: job
    batchSize: 1000
    iterator: (row) ->
      return false unless row.PatId

      patient =
        external:
          eoswin:
            id: row.PatId.toString()
            note: parseNote(row)
            timestamps:
              importedAt: moment().toDate()
              importedBy: job.data.userId
              externalUpdatedAt: parseTime(row.LastDatum, row.LastZeit)
              externalUpdatedBy: row.LastUser

        insuranceId: row.VersNr
        createdAt: parseTime(row.AnlDat, row.AnlZeit)
        createdBy: job.data.userId
        profile:
          firstName: row.Vorname
          lastName: row.Zuname
          titlePrepend: parseTitlePrepend(row.Titel)
          gender: parseGender(row.Geschl)
          birthday: dateToDay(parseDate(row.GebDat))
          contacts: parseContacts(row)
          address:
            line1: row.Strasse
            postalCode: row.Plz
            locality: row.Ort
            country: parseCountry(row.LandCode)

      delete patient.external.eoswin.timestamps.externalUpdatedAt unless patient.external.eoswin.timestamps.externalUpdatedAt
      delete patient.profile.birthday unless patient.profile.birthday
      delete patient.createdAt unless patient.createdAt

      return patient

    bulk: (records) ->
      bulk.upsert
        records: records
        job: job
        mongodb:
          collection: Patients
          selector: 'external.eoswin.id'
        elasticsearch:
          type: 'patients'

  job.done() and callback()
