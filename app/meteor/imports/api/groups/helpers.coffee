{ Meteor } = require 'meteor/meteor'
{ Users } = require '/imports/api/users'

module.exports =
  users: (selector = {}) ->
    selector.groupId = @_id
    users = Users.find selector,
      sort: { 'profile.lastName': 1 }

    users.fetch()

  usersCount: ->
    Users.find(groupId: @_id).count()
