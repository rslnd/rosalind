@Schedules = new Mongo.Collection('schedules')
Ground.Collection(Schedules)

Schema.Schedules = new SimpleSchema
  userId:
    type: SimpleSchema.RegEx.Id,
    index: 1
    optional: true

  available:
    type: Boolean
    index: 1
    optional: true

  validFrom:
    type: Date
    optional: true

  validUntil:
    type: Date
    optional: true

  schedule:
    type: Array
    maxCount: 7
    optional: true

  'schedule.$':
    type: Object

  'schedule.$.day':
    type: String
    autoform:
      options: _.map(Time.weekdays(), (v, k) -> { label: v.label, value: k })

  'schedule.$.shift':
    type: Array

  'schedule.$.shift.$':
    type: Object
    optional: true

  'schedule.$.shift.$.start.h':
    type: Number
    min: 0
    max: 23

  'schedule.$.shift.$.start.m':
    type: Number
    min: 0
    max: 59
    optional: true

  'schedule.$.shift.$.end.h':
    type: Number
    min: 0
    max: 23
  'schedule.$.shift.$.end.m':
    type: Number
    min: 0
    max: 59
    optional: true

  createdAt:
    type: Date
    autoValue: Util.autoCreatedAt
    optional: true

  createdBy:
    type: String
    autoValue: Util.autoCreatedBy
    optional: true

Schedules.helpers
  isValid: (range) -> true

  totalHoursWeek: ->
    _.reduce(@schedule, (total, day) =>
      hours = @totalHoursDay(day)
      hours = 0 if not hours
      total += hours
     , 0)

  totalHoursDay: (day) ->
    day = @getDay(day) if (typeof day is 'string')
    return unless day?
    shifts = _.map(day.shift, (shift) ->
      if (shift?.end and shift?.start)
        h = shift.end.h - shift.start.h
        h += (shift.end.m / 60) if (shift.end.m)
        h -= (shift.start.m / 60) if (shift.start.m)
        h)
    _.reduce(shifts, ((total, hours) -> total + hours), 0)

  getDay: (weekday) ->
    _.find(@schedule, (day) -> day.day is weekday)

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

Meteor.startup ->
  Schedules.attachSchema(Schema.Schedules)
