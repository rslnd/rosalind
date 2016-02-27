Meteor.startup ->
  Reports.upsert = (report) ->
    if Reports.findOne(day: report.day)
      Reports.update({ day: report.day }, { $set: report })
    else
      Reports.insert(report)
