import moment from 'moment-timezone'
import { __ } from '../../i18n'

module.exports =
  privateOrInsurance: ->
    if @privateAppointment
      __('appointments.private')
    else
      __('appointments.insurance')

  # open: ->
  #   not @admittedAt? and not @admittedBy? and not @treatedAt? and not @treatedBy? and not @removed

  # admitted: ->
  #   @admittedAt? and @admittedBy? and not @treatedAt? and not @treatedBy? and not @removed

  # treated: ->
  #   @admittedAt? and @admittedBy? and @treatedAt? and @treatedBy? and not @removed

  notes: ->
    n = [@note, @external?.terminiko?.note]
    return _.filter(n, (s) -> s and s.length >= 1).join('\n')

  duration: ->
    moment.duration(@end - @start)
