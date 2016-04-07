users = require '/imports/api/users/table'
groups = require '/imports/api/groups/table'

Template.users.helpers
  tableUsers: ->
    users

  tableGroups: ->
    groups
