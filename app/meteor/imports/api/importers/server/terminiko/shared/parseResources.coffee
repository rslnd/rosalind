import { Meteor } from 'meteor/meteor'
import { Users } from '../../../../users'
import { Tags } from '../../../../tags'
import mdb from '../../shared/mdb'

module.exports = (job) ->

  resources = {}
  resources = parseDoctors(job, resources)
  resources = parseTags(job, resources)

  job.log('Terminiko: Parsed Resources: ' + JSON.stringify(resources))

  return resources

parseDoctors = (job, resources) ->
  mdb
    path: job.data.path
    table: 'DocRooms'
    delete: false
    iterator: (record) ->
      $set = {}

      if record.Name.match(/notfall|unangemeldet|XXX/i)?
        $set.assigneeId = null

      if record.Name.match(/privat/i)?
        $set.privateAppointment = true

      if assignee = Users.methods.queryExactlyOne(record.Name)
        $set.assigneeId = assignee._id

      if Object.keys($set).length is 0
        job.log("Terminiko: parseDoctors: Unknown resource #{JSON.stringify(record)}")
      key = 'D' + record.Kennummer
      resources[key] = $set

  return resources


parseTags = (job, resources) ->
  mdb
    path: job.data.path
    table: 'Untersuchungen'
    delete: false
    iterator: (record) ->
      Tags.methods.findOneOrInsert(tag: record.Kurz, description: record.Name)

      key = 'U' + record.Kennummer
      resources[key] = record.Kurz

  return resources
