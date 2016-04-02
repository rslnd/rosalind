moment = require 'moment'
chain = require 'lodash/chain'
Time = require '/imports/util/time'
adt = require '../shared/adt'
bulk = require '../shared/bulk'
{ Reports } = require '/imports/api/reports'

module.exports = (job, callback) ->
  job.log('EoswinReports: Running')

  unless job.data?.meta?.id
    job.log('[Job] eoswinReports: No id provided')
    return job.done() and callback()

  adt
    path: job.data.path
    all: (rows) ->
      assignees = parseAssignees(rows)
      report =
        external:
          eoswin:
            id: job.data.meta.id
            timestamps:
              importedAt: moment().toDate()
              importedBy: job.data.userId
        day: Time.dateToDay(moment(job.data.meta.day, 'YYYYMMDD'))
        assignees: assignees

      Reports.upsert(report)

  job.done() and callback()


parseAssignees = (rows) ->
  insuranceCodes =
    surgeries: 502
    newPatients: 540
    match: (text, key) ->
      return unless text and text.length > 5
      code = @[key]
      regexp = new RegExp("\\[#{ code }\\] \\* (\\d+)")
      match = text.match(regexp)
      match and parseInt(match[1])

  assignees = {}
  currentAssigneeId = null

  rows.forEach (record) ->
    assignee = assignees[currentAssigneeId]

    if record.Kurzz.match(/A\d+/)
      currentAssigneeId = Meteor.users.queryExactlyOne(record.Text)?._id or null

      unless assignees[currentAssigneeId]?.patients?.total
        assignees[currentAssigneeId] =
          revenue: 0
          patients:
            new: 0
            surgeries: 0
            recall: 0
            total: 0

    else if newPatients = insuranceCodes.match(record.Text, 'newPatients')
      assignee.patients.new += newPatients

    else if surgeries = insuranceCodes.match(record.Text, 'surgeries')
      assignee.patients.surgeries += surgeries

    else if record.Kurzz is 'KS'
      assignee.patients.total += parseInt(record.Text)

    else if record.Kurzz is 'E'
      assignee.revenue += parseFloat(parseFloat(record.Info).toFixed(2))

  assignees = chain(assignees)
    .map (assignee, id) ->
      assignee.id = id
      return assignee
    .filter (a) -> a.patients.total > 0
    .map (a) ->

      if a.patients.total < a.patients.new
        a.patients.total = a.patients.new

      a.patients.recall = a.patients.total - a.patients.new
      return a
    .sortBy('revenue').reverse()
    .value()

  return assignees
