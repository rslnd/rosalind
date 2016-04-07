moment = require 'moment'
reduce = require 'lodash/reduce'
find = require 'lodash/find'
some = require 'lodash/some'
map = require 'lodash/map'
Time = require '/imports/util/time'

module.exports =
  isValid: (range) -> true

  isWithin: (options = {}) ->
    options.time ||= moment()
    options.within ||= 'hour'

    weekday = Time.toWeekday(options.time)
    if day = @getDay(weekday)
      shifts = map day.shift, (s) ->
        if s?.start and s?.end
          start = options.time.clone().hour(s.start.h).minute(s.start.m or 0).second(0)
          end = options.time.clone().hour(s.end.h).minute(s.end.m or 0).second(0)
          range = moment.range(start, end)

      return some shifts, (s) -> s.contains(options.time)

  totalHoursPerWeek: ->
    reduce(@schedule, (total, day) =>
      hours = @totalHoursPerDay(day)
      hours = 0 if not hours
      total += hours
     , 0)

  totalHoursPerDay: (day) ->
    day = @getDay(day) if (typeof day is 'string')
    return unless day?
    shifts = map(day.shift, (shift) ->
      if (shift?.end and shift?.start)
        h = shift.end.h - shift.start.h
        h += (shift.end.m / 60) if (shift.end.m)
        h -= (shift.start.m / 60) if (shift.start.m)
        h)
    reduce(shifts, ((total, hours) -> total + hours), 0)

  getDay: (weekday) ->
    find(@schedule, (day) -> day.day is weekday)

  stringify: (weekday) ->
    return unless shift = @getDay(weekday)?.shift
    shift = shift.map (s) ->
      [
        Time.format('H:mm', s.start)
        '-'
        Time.format('H:mm', s.end)
      ].join('')
    shift.join('\n')
