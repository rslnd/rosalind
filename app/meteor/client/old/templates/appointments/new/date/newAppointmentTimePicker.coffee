{ dateToDay } = require 'util/time/day'
{ Cache } = require 'api/cache'

Template.newAppointmentTimePicker.helpers
  hours: ->
    key = dateToDay(newAppointment.get('date'))
    cache = Cache.findOne({ day: key })

    _.map [7...19], (i) ->
      className = '-disabled-' if not cache?.hours[i.toString()].isOpen

      { hour: i, className }

  blocks: ->
    blocks = (i for i in [0..50] by 10)
    key = dateToDay(newAppointment.get('date'))
    hour = newAppointment.get('hour') or 11
    cache = Cache.findOne({ day: key })

    _.map blocks, (i) ->
      className = '-disabled-' if not cache?.hours[hour.toString()]?.minutes[i.toString()]?.isOpen
      i = '00' if i is 0
      { block: i, className }



Template.newAppointmentTimePicker.events
  'click .datepicker--cell-h': (e) ->
    el = $(e.target)
    hour = parseInt(el.text())
    $('.datepicker--cell-h').removeClass('-selected-')
    el.addClass('-selected-')
    console.log('[Appointments] New: selected hour', hour)
    newAppointment.set('hour', hour)
    newAppointment.set('previousHour', hour) if newAppointment.get('previousHour')


  'click .datepicker--cell-m': (e) ->
    el = $(e.target)
    minute = parseInt(el.text())
    $('.datepicker--cell-m').removeClass('-selected-')
    el.addClass('-selected-')
    console.log('[Appointments] New: selected minute', minute)
    newAppointment.set('minute', minute)

  'mouseover .datepicker--cell-h': (e) ->
    el = $(e.currentTarget)
    hour = el.data('hour')
    console.log('hover hour', hour)
    newAppointment.set('previousHour', hour) unless newAppointment.get('previousHour')
    newAppointment.set('hour', hour)

  'mouseleave .datepicker--cell-h': (e) ->
    return unless previousHour = newAppointment.get('previousHour')
    console.log('mouseout, previous hour was', previousHour)
    newAppointment.set('hour', previousHour)
    newAppointment.set('previousHour', null)
