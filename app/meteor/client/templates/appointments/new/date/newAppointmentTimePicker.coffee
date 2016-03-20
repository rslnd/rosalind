Template.newAppointmentTimePicker.events
  'click .datepicker--cell-h': (e) ->
    el = $(e.target)
    hour = parseInt(el.text())
    $('.datepicker--cell-h').removeClass('-selected-')
    el.addClass('-selected-')
    console.log('[Appointments] New: selected hour', hour)
    newAppointment.set('hour', hour)

  'click .datepicker--cell-m': (e) ->
    el = $(e.target)
    minute = parseInt(el.text())
    $('.datepicker--cell-m').removeClass('-selected-')
    el.addClass('-selected-')
    console.log('[Appointments] New: selected minute', minute)
    newAppointment.set('minute', minute)
