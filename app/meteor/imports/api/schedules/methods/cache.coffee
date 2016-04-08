moment = require 'moment'
some = require 'lodash/some'
{ Cache } = require '/imports/api/cache'

module.exports = (Schedules) ->
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


  cacheNextDays: (nextDays) ->
    cache = []

    time = moment().hour(0).minute(0).second(30)

    for day in [0..nextDays]
      time = time.clone().add(day, 'days')

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

        for minute in [0..59]
          time = time.clone().minute(minute)

          mm = time.minute()

          day.hours[hh].minutes[mm] ||= {}
          day.hours[hh].minutes[mm] =
            isOpen: Schedules.methods.isOpen({ time })

        day.hours[hh].isOpen = some(day.hours[hh].minutes, { isOpen: true })

      day.isOpen = some(day.hours, { isOpen: true })

      cache.push(day)

    return cache
