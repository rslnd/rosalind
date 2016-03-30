Meteor.startup ->
  TabularJobCollections
    import:
      sub: new SubsManager()
      collection: @Jobs.Import
      allow: (userId) ->
        user = Meteor.users.findOne(userId)
        user and Roles.userIsInRole(user, 'admin')
