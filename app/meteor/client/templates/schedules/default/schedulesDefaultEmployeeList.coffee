Template.schedulesDefaultEmployeeList.helpers
  employeeGroups: ->
    Meteor.users.byGroup({ 'profile.employee': true })

  linkToDefaultScheduleForUser: ->
    '/schedules/default/' + @username

  totalHoursWeek: ->
    defaultSchedule = Schedules.findOne({ userId: @_id })
    if defaultSchedule
      hm = Time.hm(defaultSchedule.totalHoursWeek())
      Time.format('h[h]( m[m])', hm)
    else
      '0h'
