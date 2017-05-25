import users from 'api/users/table'
import groups from 'api/groups/table'

Template.users.helpers
  tableUsers: ->
    users

  tableGroups: ->
    groups


Template.users.events
  'click a': (e) ->
    e.preventDefault()
    window.__deprecated_history_push($(e.target).attr('href'))
