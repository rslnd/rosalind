map = require 'lodash/map'
some = require 'lodash/some'
union = require 'lodash/union'
moment = require 'moment'

module.exports = ({ Schedules, Appointments, Cache }) ->
  updateCache: (nextDays = 10) ->
    console.log('[Schedules] Caching next ' + nextDays + ' days')
    caches = @cacheNextDays(nextDays)

    caches.forEach (cache) ->
      if _id = Cache.findOne({ day: cache.day })?._id
        Cache.update(_id, { $set: cache })
      else
        Cache.insert(cache)

    console.log('[Schedules] Cached next ' + nextDays + ' days')

    return caches


  cacheNextDays: (nextDays = 10) ->
    cache = []


    for dayOffset in [0...nextDays]
      time = moment().hour(0).minute(0).second(30)
      time = time.clone().add(dayOffset, 'days')

      day = {}
      day.day =
        year: time.year()
        month: time.month() + 1
        day: time.date()
      day.hours = {}

      for hour in [0..23]
        time = time.clone().hour(hour)

        hh = time.hour()

        day.hours[hh] || = {}
        day.hours[hh].minutes ||= {}

        for minuteBlock in [0..5]
          time = time.clone().minute(10 * minuteBlock)

          mm = time.minute()

          day.hours[hh].minutes[mm] ||= {}
          day.hours[hh].minutes[mm] =
            isOpen: Schedules.methods.isOpen({ time })
            scheduled: map(Schedules.methods.getScheduled(time), (u) -> u._id)
            appointments: map(Appointments.methods.findAll(time, 'block').fetch(), (a) -> a._id._str)

        day.hours[hh].isOpen = some(day.hours[hh].minutes, { isOpen: true })
        day.hours[hh].scheduled = union(map(day.hours[hh].minutes, (m) -> m.scheduled)...)
        day.hours[hh].appointments = union(map(day.hours[hh].minutes, (m) -> m.appointments)...)

      day.isOpen = some(day.hours, { isOpen: true })
      day.scheduled = union(map(day.hours, (h) -> h.scheduled)...)
      day.appointments = union(map(day.hours, (h) -> h.appointments)...)

      cache.push(day)

    return cache
