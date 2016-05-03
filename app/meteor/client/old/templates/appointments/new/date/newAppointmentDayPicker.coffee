{ moment } = require '/imports/util/momentLocale'
{ Schedules } = require '/imports/api/schedules'
{ Cache } = require '/imports/api/cache'
Time = require '/imports/util/time'

Template.newAppointmentDayPicker.onRendered ->
  dayPickerOptions =
    language: moment().locale().split('-')[0]
    toggleSelected: false
    minDate: Time.startOfToday()
    minDate: moment().startOf('day').toDate()
    onChangeView: (view) ->
      return if view is 'days'
      dp1 = $('#day-picker-1').datepicker().data('datepicker')
      dp2 = $('#day-picker-2').datepicker().data('datepicker')
      dp1.view = dp2.view = 'days'
    onRenderCell: (date, cellType) ->
      return unless cellType is 'day'

      day = Time.dateToDay(date)
      cache = Cache.findOne({ day })

      return {
        disabled: not cache?.isOpen
      }


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
    minDate: moment().startOf('day').add(1, 'month').toDate()
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

    $('#day-picker-2').datepicker().data('datepicker').date = moment().add(1, 'month').toDate()


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
