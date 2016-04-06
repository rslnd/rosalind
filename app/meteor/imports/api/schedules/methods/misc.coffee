moment = require 'moment'
each = require 'lodash/each'
map = require 'lodash/map'
keys = require 'lodash/keys'
Time = require '/imports/util/time'

module.exports = (collection) ->
  getScheduledHours: (options = {}) ->
    defaultSchedule = collection.findOne
      userId: options.userId
      type: 'default'

    return unless defaultSchedule
    return unless options.day

    day = Time.toWeekday(Time.dayToDate(options.day))
    defaultSchedule.totalHoursPerDay(day)

  getResources: ->
    map(keys(Meteor.users.byGroup()), (resourceId) -> { id: resourceId, title: resourceId })

  getEvents: (options = {}) ->
    options.selector ||= {}
    options.range ||= {}

    schedule = collection.find(options.selector).fetch()
    events = []

    each schedule, (schedule) ->
      return unless schedule.isValid(options.range)
      user = Meteor.users.findOne(_id: schedule.userId)

      each schedule.schedule, (dailySchedule) ->
        return unless dailySchedule?
        currentDay = moment().startOf('isoWeek').add(Time.weekdays()[dailySchedule.day].offset, 'days')

        each dailySchedule.shift, (shift) ->
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

  updateEvent: (_id, e) ->
    console.warn('updating events not implemented')
    # e.schedule.start = e.start.toDate()
    # e.schedule.end = e.end.toDate()
    #
    # e.schedule = _.omit(e.schedule, '_id')
    #
    # collection.update(_id, { $set: e.schedule })
