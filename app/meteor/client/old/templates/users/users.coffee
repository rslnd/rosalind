users = require 'api/users/table'
groups = require 'api/groups/table'

Template.users.helpers
  tableUsers: ->
    users

  tableGroups: ->
    groups
