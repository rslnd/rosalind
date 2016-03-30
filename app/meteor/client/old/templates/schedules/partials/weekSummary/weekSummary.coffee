Template.weekSummary.helpers
  weekdaysWithSchedule: ->
    @schedule = @viewUser.defaultSchedule() if @viewUser

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
