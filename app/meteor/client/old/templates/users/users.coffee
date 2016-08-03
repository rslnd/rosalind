users = require 'api/users/table'
groups = require 'api/groups/table'
{ browserHistory } = require 'react-router'

Template.users.helpers
  tableUsers: ->
    users

  tableGroups: ->
    groups


Template.users.events
  'click a': (e) ->
    e.preventDefault()
    browserHistory.push($(e.target).attr('href'))
