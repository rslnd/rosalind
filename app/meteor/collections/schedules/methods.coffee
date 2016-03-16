Meteor.startup ->

  Schedules.getScheduledHours = (options = {}) ->
    defaultSchedule = Schedules.findOne
      userId: options.userId
      type: 'default'

    return unless defaultSchedule
    return unless options.day

    day = moment(Time.dayToDate(options.day)).locale('en').format('ddd').toLowerCase()
    defaultSchedule.totalHoursPerDay(day)

  Schedules.getResources = ->
    _.map(_.keys(Meteor.users.byGroup()), (resourceId) -> { id: resourceId, title: resourceId })

  Schedules.getEvents = (options = {}) ->
    options.selector ||= {}
    options.range ||= {}

    schedule = Schedules.find(options.selector).fetch()
    events = []

    _.each schedule, (schedule) ->
      return unless schedule.isValid(options.range)
      user = Meteor.users.findOne(_id: schedule.userId)

      _.each schedule.schedule, (dailySchedule) ->
        return unless dailySchedule?
        currentDay = moment().startOf('isoWeek').add(Time.weekdays()[dailySchedule.day].offset, 'days')

        _.each dailySchedule.shift, (shift) ->
          return unless (shift and shift.start and shift.end)
          start = currentDay.clone().add(shift.start.h, 'hours').add(shift.start.m, 'minutes')
          end = currentDay.clone().add(shift.end.h, 'hours').add(shift.end.m, 'minutes')

          if schedule.type is 'businessHours'
            events.push
              start: start
              end: end
              rendering: 'inverse-background'
              color: '#fff'
          else
            events.push
              start: start
              end: end
              editable: true
              resourceId: user.group()
              title: user.fullNameWithTitle()
              scheduleId: schedule._id

    events

  Schedules.updateEvent = (_id, e) ->
    console.warn('updating events not implemented')
    # e.schedule.start = e.start.toDate()
    # e.schedule.end = e.end.toDate()
    #
    # e.schedule = _.omit(e.schedule, '_id')
    #
    # Schedules.update(_id, { $set: e.schedule })
