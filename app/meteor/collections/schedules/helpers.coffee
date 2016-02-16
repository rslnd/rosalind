Meteor.startup ->
  Schedules.helpers
    isValid: (range) -> true

    totalHoursWeek: ->
      _.reduce(@schedule, (total, day) =>
        hours = @totalHoursDay(day)
        hours = 0 if not hours
        total += hours
       , 0)

    totalHoursDay: (day) ->
      day = @getDay(day) if (typeof day is 'string')
      return unless day?
      shifts = _.map(day.shift, (shift) ->
        if (shift?.end and shift?.start)
          h = shift.end.h - shift.start.h
          h += (shift.end.m / 60) if (shift.end.m)
          h -= (shift.start.m / 60) if (shift.start.m)
          h)
      _.reduce(shifts, ((total, hours) -> total + hours), 0)

    getDay: (weekday) ->
      _.find(@schedule, (day) -> day.day is weekday)
