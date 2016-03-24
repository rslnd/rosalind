Meteor.startup ->
  Groups.helpers
    users: ->
      users = Meteor.users.find { groupId: @_id },
        sort: { 'profile.lastName': 1 }

      users.fetch()

    usersCount: ->
      Meteor.users.find(groupId: @_id).count()

    collection: ->
      Groups
