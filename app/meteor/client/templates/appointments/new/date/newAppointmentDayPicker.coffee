Template.newAppointmentDayPicker.onRendered ->
  $('#day-picker').datepicker
    language: moment().locale().split('-')[0]
    minDate: Time.startOfToday()
    onRenderCell: (date, cellType) ->
      if cellType is 'day'
        rand = parseInt(Math.random()*100)
        return { classes: 'day-closed' } if rand < 5
        return { classes: 'day-recommended' } if rand < 30
        return { classes: 'day-full' } if rand < 60

