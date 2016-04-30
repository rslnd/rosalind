map = require 'lodash/map'
some = require 'lodash/some'
moment = require 'moment'

module.exports = ({ Schedules }) ->
  isOpen: (options = {}) ->
    options.time = options if options._isAMomentObject
    options.time ||= moment()
    options.within ||= 'minute'

    if Schedules.methods.isBusinessHoursOverride(options)
      true
    else if Schedules.methods.isHoliday(options)
      false
    else if Schedules.methods.isRegularBusinessHours(options)
      true
    else
      false

  isHoliday: (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    holidays = Schedules.find
      type: 'holidays'
      start: { $lte: options.time.toDate() }
      end: { $gte: options.time.toDate() }
      removed: { $ne: true }

    return holidays.count() > 0

  isBusinessHoursOverride: (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    overrides = Schedules.find
      type: 'businessHoursOverride'
      start: { $gte: options.time.clone().startOf('day').toDate() }
      end: { $lte: options.time.clone().endOf('day').toDate() }
      removed: { $ne: true }

    overrides = overrides.fetch()
    if overrides.length > 0
      overrides = map overrides, (o) ->
        moment.range(o.start, o.end)

      some overrides, (o) -> o.contains(options.time)

  isRegularBusinessHours: (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    businessHoursRegular = Schedules.findOne
      type: 'businessHours'
      removed: { $ne: true }

    businessHoursRegular = businessHoursRegular?.isWithin(options)
