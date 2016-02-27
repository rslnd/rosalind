Meteor.startup ->
  Reports.upsert = (report) ->
    report = Reports.tally(report)

    if Reports.findOne(day: report.day)
      Reports.update({ day: report.day }, { $set: report })
    else
      Reports.insert(report)


  Reports.tally = (report) ->
    report.total ||= {}

    report.assignees = report.assignees.map (a) ->
      a.patients.newPercentage = 100.0 * a.patients.new / a.patients.total
      return a

    report.total.revenue = _.chain(report.assignees)
      .map (a) -> a.revenue
      .reduce ((a, b) -> a + b), 0.0
      .value()

    report.total.revenuePerAssignee =
      report.total.revenue / report.assignees.length

    report.total.patients = _.chain(report.assignees)
      .map (a) -> a.patients.total
      .reduce ((a, b) -> a + b), 0.0
      .value()

    report.total.patientsNew = _.chain(report.assignees)
      .map (a) -> a.patients.new
      .reduce ((a, b) -> a + b), 0.0
      .value()

    report.createdAt = new Date()

    return report
