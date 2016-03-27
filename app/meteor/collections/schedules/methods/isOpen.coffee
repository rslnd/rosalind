Meteor.startup ->
  Schedules.isOpen = (time = moment()) ->
    if Schedules.isBusinessHoursOverride(time)
      true
    else if Schedules.isHoliday(time)
      false
    else if Schedules.isRegularBusinessHours(time)
      true
    else
      false

  Schedules.isHoliday = (time = moment()) ->
    holidays = Schedules.find
      type: 'holidays'
      start: { $lte: time.toDate() }
      end: { $gte: time.toDate() }
      removed: { $ne: true }

    return holidays.count() > 0

  Schedules.isBusinessHoursOverride = (time = moment()) ->
    overrides = Schedules.find
      type: 'businessHoursOverride'
      start: { $gte: time.clone().startOf('day').toDate() }
      end: { $lte: time.clone().endOf('day').toDate() }
      removed: { $ne: true }

    overrides = overrides.fetch()
    if overrides.length > 0
      overrides = _.map overrides, (o) ->
        moment.range(o.start, o.end)

      _.any overrides, (o) -> o.contains(time)

  Schedules.isRegularBusinessHours = (time = moment()) ->
    businessHoursRegular = Schedules.findOne
      type: 'businessHours'
      removed: { $ne: true }

    businessHoursRegular = businessHoursRegular?.isWithin(time)
