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


  summary: (key) ->
    newAppointment.get(key) or Helpers.noValue()
