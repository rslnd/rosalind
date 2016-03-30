moment = require 'moment'

module.exports = (collection) ->
  isOpen: (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    if collection.isBusinessHoursOverride(options)
      true
    else if collection.isHoliday(options)
      false
    else if collection.isRegularBusinessHours(options)
      true
    else
      false

  isHoliday: (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    holidays = collection.find
      type: 'holidays'
      start: { $lte: options.time.toDate() }
      end: { $gte: options.time.toDate() }
      removed: { $ne: true }

    return holidays.count() > 0

  isBusinessHoursOverride: (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    overrides = collection.find
      type: 'businessHoursOverride'
      start: { $gte: options.time.clone().startOf('day').toDate() }
      end: { $lte: options.time.clone().endOf('day').toDate() }
      removed: { $ne: true }

    overrides = overrides.fetch()
    if overrides.length > 0
      overrides = _.map overrides, (o) ->
        moment.range(o.start, o.end)

      _.any overrides, (o) -> o.contains(options.time)

  isRegularBusinessHours: (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    businessHoursRegular = collection.findOne
      type: 'businessHours'
      removed: { $ne: true }

    businessHoursRegular = businessHoursRegular?.isWithin(options)
