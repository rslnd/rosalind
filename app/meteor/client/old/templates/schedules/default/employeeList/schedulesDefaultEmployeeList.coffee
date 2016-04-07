Time = require '/imports/util/time'
{ Schedules } = require '/imports/api/schedules'
{ Users } = require '/imports/api/users'

Template.schedulesDefaultEmployeeList.helpers
  employeeGroups: ->
    Users.methods.byGroup({ 'profile.employee': true })

  linkToDefaultScheduleForUser: ->
    '/schedules/default/' + @username

  totalHoursPerWeek: ->
    defaultSchedule = Schedules.findOne({ userId: @_id })
    if defaultSchedule
      hm = Time.hm(defaultSchedule.totalHoursPerWeek())
      Time.format('h[h]( m[m])', hm)
    else
      '0h'
