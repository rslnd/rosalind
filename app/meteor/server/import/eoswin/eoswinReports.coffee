Meteor.startup ->
  Job.processJobs 'import', 'eoswinReports', (job, callback) ->
    job.log('EoswinReports: Running')

    Import.Adt
      path: job.data.path
      all: (rows) ->
        assignees = parseAssignees(rows)
        report =
          day: job.data.meta.day
          assignees: assignees

        console.log(report)

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
      assigneeId = record.Text
      currentAssigneeId = assigneeId
      assignees[assigneeId] =
        patients: {}

    else if newPatients = insuranceCodes.match(record.Text, 'newPatients')
      assignee.patients.new = newPatients

    else if surgeries = insuranceCodes.match(record.Text, 'surgeries')
      assignee.patients.surgeries = surgeries

    else if record.Kurzz is 'KS'
      assignee.patients.total = parseInt(record.Text)

    else if record.Kurzz is 'E'
      assignee.revenue = parseFloat(record.Info)

  return assignees
