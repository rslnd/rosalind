Time = require 'util/time'
{ Schedules } = require 'api/schedules'

Template.weekSummary.helpers
  weekdaysWithSchedule: ->
    if @viewUser
      @schedule = Schedules.findOne(userId: @viewUser._id, type: 'default')

    Time.weekdaysArray().map (day) =>
      day.schedule = @schedule
      day.user = @viewUser
      return day

  totalHoursPerDay: ->
    if @schedule
      if hours = @schedule.totalHoursPerDay(@short)
        Time.format('h[h]( m[m])', Time.hm(hours))

  shifts: ->
    @schedule.stringify(@short) if @schedule
