Meteor.startup ->
  Schedules.helpers
    isValid: (range) -> true

    totalHoursPerWeek: ->
      _.reduce(@schedule, (total, day) =>
        hours = @totalHoursPerDay(day)
        hours = 0 if not hours
        total += hours
       , 0)

    totalHoursPerDay: (day) ->
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

    stringify: (weekday) ->
      return unless shift = @getDay(weekday)?.shift
      shift = shift.map (s) ->
        [
          Time.format('H:mm', s.start)
          '-'
          Time.format('H:mm', s.end)
        ].join('')
      shift.join('\n')

    collection: ->
      Schedules
