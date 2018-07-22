import Spacebars from 'meteor/spacebars'

module.exports = ->
  unresolve: ->
    Spacebars.SafeString('<a class="unresolve">Markierung entfernen</a>')
