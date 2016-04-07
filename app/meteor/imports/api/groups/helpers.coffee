{ Meteor } = require 'meteor/meteor'

module.exports =
  users: (selector = {}) ->
    selector.groupId = @_id
    users = Meteor.users.find selector,
      sort: { 'profile.lastName': 1 }

    users.fetch()

  usersCount: ->
    Meteor.users.find(groupId: @_id).count()
