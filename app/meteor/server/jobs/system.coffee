TabularJobCollections.authenticateMethods = (userId) ->
  user = Meteor.users.findOne(userId)
  user and Roles.userIsInRole(user, 'admin')
