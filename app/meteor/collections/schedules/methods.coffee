Meteor.startup ->
  Schedules.getResources = ->
    _.map(_.keys(Meteor.users.byGroup()), (resourceId) -> { id: resourceId, title: resourceId })

  Schedules.getEvents = (range) ->
    defaultSchedules = Schedules.find({}).fetch()
    events = []


    _.each defaultSchedules, (defaultSchedule) ->
      return unless defaultSchedule.isValid(range)
      user = Meteor.users.findOne(defaultSchedule.userId)

      _.each defaultSchedule.schedule, (dailySchedule) ->
        return unless dailySchedule?
          currentDay = moment().startOf('isoWeek').add(Time.weekdays()[dailySchedule.day].offset, 'days')

          _.each dailySchedule.shift, (shift) ->
            return unless (shift and shift.start and shift.end)
              start = currentDay.clone().add(shift.start.h, 'hours').add(shift.start.m, 'minutes')
              end = currentDay.clone().add(shift.end.h, 'hours').add(shift.end.m, 'minutes')

              events.push
                start: start
                end: end
                editable: true
                resourceId: user.group()
                title: user.fullNameWithTitle()
                defaultScheduleId: defaultSchedule._id

    events

  Schedules.updateEvent = (_id, e) ->
    console.warn('updating events not implemented')
    # e.schedule.start = e.start.toDate()
    # e.schedule.end = e.end.toDate()
    #
    # e.schedule = _.omit(e.schedule, '_id')
    #
    # Schedules.update(_id, { $set: e.schedule })
