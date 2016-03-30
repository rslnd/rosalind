Meteor.startup ->
  Schedules.isOpen = (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    if Schedules.isBusinessHoursOverride(options)
      true
    else if Schedules.isHoliday(options)
      false
    else if Schedules.isRegularBusinessHours(options)
      true
    else
      false

  Schedules.isHoliday = (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    holidays = Schedules.find
      type: 'holidays'
      start: { $lte: options.time.toDate() }
      end: { $gte: options.time.toDate() }
      removed: { $ne: true }

    return holidays.count() > 0

  Schedules.isBusinessHoursOverride = (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    overrides = Schedules.find
      type: 'businessHoursOverride'
      start: { $gte: options.time.clone().startOf('day').toDate() }
      end: { $lte: options.time.clone().endOf('day').toDate() }
      removed: { $ne: true }

    overrides = overrides.fetch()
    if overrides.length > 0
      overrides = _.map overrides, (o) ->
        moment.range(o.start, o.end)

      _.any overrides, (o) -> o.contains(options.time)

  Schedules.isRegularBusinessHours = (options = {}) ->
    options.time ||= moment()
    options.within ||= 'minute'

    businessHoursRegular = Schedules.findOne
      type: 'businessHours'
      removed: { $ne: true }

    businessHoursRegular = businessHoursRegular?.isWithin(options)
