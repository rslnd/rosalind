import { __ } from '../../i18n'
import Spacebars from 'meteor/spacebars'

module.exports = ->
  privateOrInsurance: ->
    if @privatePatient
      __('inboundCalls.private')
    else
      __('inboundCalls.insurance')

  unresolve: ->
    Spacebars.SafeString('<a class="unresolve">Markierung entfernen</a>')
