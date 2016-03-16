Meteor.startup ->
  Reports.upsert = (report) ->
    report = Reports.tally(report)

    console.log('[Reports] Upserting', report)

    if Reports.findOne(day: report.day)
      Reports.update({ day: report.day }, { $set: report })
    else
      Reports.insert(report)


  Reports.tally = (report) ->
    report.total ||= {}

    report.assignees = report.assignees.map (a) ->
      a.hours ||= {}
      a.patients.newPercentage = 100.0 * a.patients.new / a.patients.total
      a.hours.scheduled = Schedules.getScheduledHours({ userId: a.id, day: report.day })
      a.patients.perHourScheduled = a.patients.total / a.hours.scheduled
      a.patients.newPerHourScheduled = a.patients.new / a.hours.scheduled
      return a

    ax = _.chain(report.assignees)
      .filter (a) -> a.patients.newPerHourScheduled > 0
      .map (a) -> a.patients.newPerHourScheduled
      .value()
    report.total.patientsNewPerHourScheduled = _.reduce(ax, ((a, b) -> a + b), 0.0) / ax.length

    report.total.revenue = _.chain(report.assignees)
      .map (a) -> a.revenue
      .reduce ((a, b) -> a + b), 0.0
      .value()

    report.total.hoursScheduled = _.chain(report.assignees)
      .map (a) -> a?.hours?.scheduled or 0
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

    return report
