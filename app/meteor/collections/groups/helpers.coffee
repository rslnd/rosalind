Meteor.startup ->
  Groups.helpers
    users: ->
      Meteor.users.find(groupId: @_id).fetch()

    usersCount: ->
      Meteor.users.find(groupId: @_id).count()

    collection: ->
      Groups
