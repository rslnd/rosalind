Template.newAppointmentDayPicker.onRendered ->
  dayPickerOptions =
    language: moment().locale().split('-')[0]
    minDate: Time.startOfToday()
    onRenderCell: (date, cellType) ->
      # if cellType is 'day'
      #   rand = parseInt(Math.random()*100)
      #   return { classes: 'day-closed' } if rand < 5
      #   return { classes: 'day-recommended' } if rand < 30
      #   return { classes: 'day-full' } if rand < 60


  $('#day-picker-1').datepicker _.extend dayPickerOptions,
    onSelect: _.throttle(((f, date) ->
      return if date is ''
      newAppointment.set('date', date)
      console.log('[Appointments] New: set date', date)
      $('#day-picker-2').data('datepicker').clear()
    ), 10, trailing: false)

    onChangeMonth: _.throttle(((month, year) ->
      nextMonth = moment({ year, month }).add(1, 'month').toDate()
      $('#day-picker-2').data('datepicker').date = nextMonth
    ), 10, trailing: false)

  $('#day-picker-2').datepicker _.extend dayPickerOptions,
    onSelect: _.throttle(((f, date) ->
      return if date is ''
      newAppointment.set('date', date)
      console.log('[Appointments] New: set date', date)
      $('#day-picker-1').data('datepicker').clear()
    ), 10, trailing: false)

    onChangeMonth: _.throttle(((month, year) ->
      nextMonth = moment({ year, month }).subtract(1, 'month').toDate()
      $('#day-picker-1').data('datepicker').date = nextMonth
    ), 10, trailing: false)

Template.newAppointmentDayPicker.events
  'click .quick-jump a': (e) ->
    el = $(e.currentTarget)
    rel = el.attr('rel')
    if rel is 'asap'
      console.log('asap')
    else if rel='jump'
      days = parseInt(el.data('days'))

      newDate = moment().add(days, 'days')
      console.log('[Appointments] New: set date', newDate.toDate())
      $('#day-picker-1').data('datepicker').selectDate(newDate.toDate())
      $('#day-picker-2').data('datepicker').clear()
      $('#day-picker-2').data('datepicker').date = newDate.add(1, 'month').toDate()
