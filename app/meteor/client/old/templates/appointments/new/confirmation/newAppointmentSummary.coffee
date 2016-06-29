{ moment } = require 'util/momentLocale'
{ Mongo } = require 'meteor/mongo'
{ TAPi18n } = require 'meteor/tap:i18n'
{ Patients } = require 'api/patients'
{ Tags } = require 'api/tags'
{ Users } = require 'api/users'
Helpers = require 'util/helpers'

Template.newAppointmentSummary.helpers
  name: ->
    if _id = newAppointment.get('patientId')
      Patients.findOne(_id: new Mongo.ObjectID(_id)).fullNameWithTitle()
    else
      Helpers.noValue()

  date: ->
    if date = newAppointment.get('date')
      moment(date).format(TAPi18n.__('time.dateFormatWeekday'))
    else
      Helpers.noValue()

  time: ->
    if hour = newAppointment.get('hour')
      time = moment().hour(hour)

      if minute = newAppointment.get('minute')
        time = time.minute(minute)

      time.format(TAPi18n.__('time.timeFormat'))
    else
      Helpers.noValue()

  assignee: ->
    if _id = newAppointment.get('assigneeId')
      Users.findOne({ _id }).fullNameWithTitle()
    else
      Helpers.noValue()

  hasTags: ->
    newAppointment.get('tags')?.length > 0

  tags: ->
    Tags.find(_id: { $in: newAppointment.get('tags') }).fetch()

  summary: (key) ->
    newAppointment.get(key) or Helpers.noValue()
