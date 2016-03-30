{ Users } = require '/imports/api/users'

module.exports =
  users: ->
    users = Users.find { groupId: @_id },
      sort: { 'profile.lastName': 1 }

    users.fetch()

  usersCount: ->
    Users.find(groupId: @_id).count()
