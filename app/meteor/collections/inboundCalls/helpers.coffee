Meteor.startup ->
  InboundCalls.helpers
    privateOrInsurance: ->
      if @privatePatient
        TAPi18n.__('inboundCalls.private')
      else
        TAPi18n.__('inboundCalls.insurance')

    unresolve: ->
      Spacebars.SafeString('<a class="unresolve">Markierung entfernen</a>')

    collection: ->
      InboundCalls
