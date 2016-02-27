Meteor.startup ->
  Job.processJobs 'import', 'eoswinReports', (job, callback) ->
    job.log('EoswinReports: Running')

    Import.Adt
      path: job.data.path
      all: (rows) ->
        assignees = parseAssignees(rows)
        report =
          day: Time.dateToDay(moment(job.data.meta.day, 'YYYYMMDD'))
          assignees: assignees

        console.dir(report)

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
            total: 0

    else if newPatients = insuranceCodes.match(record.Text, 'newPatients')
      assignee.patients.new += newPatients

    else if surgeries = insuranceCodes.match(record.Text, 'surgeries')
      assignee.patients.surgeries += surgeries

    else if record.Kurzz is 'KS'
      assignee.patients.total += parseInt(record.Text)

    else if record.Kurzz is 'E'
      assignee.revenue += parseFloat(record.Info)

  byAssignee = {}
  _.each assignees, (assignee, id) ->
    byAssignee[id] = assignee if assignee.patients.total > 0

  return byAssignee
