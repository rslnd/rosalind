filter = require 'lodash/filter'
extend = require 'lodash/extend'
Time = require '/imports/util/time'
{ Appointments } = require '/imports/api/appointments'

module.exports =
  notes: ->
    n = [@note, @external?.eoswin?.note]
    return filter(n, (s) -> s and s.length >= 1).join('\n')

  appointments: (selector = {}) ->
    selector = extend(selector, patientId: @_id)
    Appointments.find selector,
      sort:
        start: -1

  pastAppointments: ->
    @appointments(start: { $lt: Time.startOfToday() })

  futureAppointments: ->
    @appointments(start: { $gt: Time.startOfToday() })
