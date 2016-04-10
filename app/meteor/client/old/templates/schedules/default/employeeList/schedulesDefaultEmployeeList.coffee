map = require 'lodash/map'
Time = require '/imports/util/time'
{ Schedules } = require '/imports/api/schedules'
{ Users } = require '/imports/api/users'
{ Groups } = require '/imports/api/groups'

Template.schedulesDefaultEmployeeList.helpers
  employeeGroups: ->
    map Groups.methods.all(), (g) ->
      group: g
      users: Users.find
        'profile.employee': true
        groupId: g._id

  linkToDefaultScheduleForUser: ->
    '/schedules/default/' + @username

  totalHoursPerWeek: ->
    defaultSchedule = Schedules.findOne({ userId: @_id })
    if defaultSchedule
      hm = Time.hm(defaultSchedule.totalHoursPerWeek())
      Time.format('h[h]( m[m])', hm)
    else
      '0h'
