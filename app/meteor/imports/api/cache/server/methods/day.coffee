merge = require 'lodash/merge'
moment = require 'moment'

module.exports =
  day: (options = {}) ->
    time = options.time or moment()
    eachBlock = options.eachBlock or -> {}
    eachHour = options.eachHour or -> {}
    eachDay = options.eachDay or -> {}

    cache =
      day:
        year: time.year()
        month: time.month() + 1
        day: time.date()
      hours: {}

    for hour in [0..23]
      time = time.clone().hour(hour)

      hh = time.hour()

      cache.hours[hh] || = {}
      cache.hours[hh].blocks ||= {}

      for minuteBlock in [0..5]
        time = time.clone().minute(10 * minuteBlock)
        mm = time.minute()

        block = cache.hours[hh].blocks[mm] or {}
        cache.hours[hh].blocks[mm] = merge(cache.hours[hh].blocks[mm], eachBlock({ hh, mm, time, block }))

      hour = cache.hours[hh]
      cache.hours[hh] = merge(cache.hours[hh], eachHour({ hh, hour }))

    cache = merge(cache, eachDay({ day: cache }))

    return cache
