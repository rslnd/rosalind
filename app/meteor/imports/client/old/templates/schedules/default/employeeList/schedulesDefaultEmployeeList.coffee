import './schedulesDefaultEmployeeList.tpl.jade'
import map from 'lodash/map'
import Time from '../../../../../../util/time'
import { Schedules } from '../../../../../../api/schedules'
import { Users } from '../../../../../../api/users'
import { Groups } from '../../../../../../api/groups'

Template.schedulesDefaultEmployeeList.helpers
  employeeGroups: ->
    map Groups.methods.all(), (g) ->
      group: g
      users: Users.find
        employee: true
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
