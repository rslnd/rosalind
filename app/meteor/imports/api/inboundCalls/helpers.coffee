import { TAPi18n } from 'meteor/tap:i18n'
import Spacebars from 'meteor/spacebars'

module.exports = ->
  privateOrInsurance: ->
    if @privatePatient
      TAPi18n.__('inboundCalls.private')
    else
      TAPi18n.__('inboundCalls.insurance')

  unresolve: ->
    Spacebars.SafeString('<a class="unresolve">Markierung entfernen</a>')
