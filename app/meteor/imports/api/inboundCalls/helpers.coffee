{ TAPi18n } = require 'meteor/tap:i18n'
Spacebars = require 'meteor/spacebars'

module.exports = ->
  privateOrInsurance: ->
    if @privatePatient
      TAPi18n.__('inboundCalls.private')
    else
      TAPi18n.__('inboundCalls.insurance')

  unresolve: ->
    Spacebars.SafeString('<a class="unresolve">Markierung entfernen</a>')
