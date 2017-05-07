map = require 'lodash/map'
Time = require 'util/time'
{ Schedules } = require 'api/schedules'
{ Users } = require 'api/users'
{ Groups } = require 'api/groups'

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

Template.schedulesDefaultEmployeeList.events
  'click [ref=interceptClick]': (e) ->
    e.preventDefault()
    url = $(e.target).attr('href')
    Template.schedulesDefault.currentView.set('refresh', url)
    window.__deprecated_history_replace(url)
