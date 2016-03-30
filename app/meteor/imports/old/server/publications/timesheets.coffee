Meteor.publish 'timesheets', ->
  return unless @userId


  Timesheets.find { userId: @userId },
    limit: 20
    sort: { end: -1 }
