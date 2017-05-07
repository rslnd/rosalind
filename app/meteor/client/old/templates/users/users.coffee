users = require 'api/users/table'
groups = require 'api/groups/table'

Template.users.helpers
  tableUsers: ->
    users

  tableGroups: ->
    groups


Template.users.events
  'click a': (e) ->
    e.preventDefault()
    window.__deprecated_history_push($(e.target).attr('href'))
