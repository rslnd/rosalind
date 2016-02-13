Meteor.startup ->
  return if Meteor.users.find({}).count() > 0

  defaultAccount =
    username: 'admin'
    password: Random.id()
    email: 'admin@example.com'
    profile:
      firstName: 'Admin'


  Winston.warn("Creating first user '#{defaultAccount.username}' with password '#{defaultAccount.password}'")
  id = Accounts.createUser(defaultAccount)
  Roles.addUsersToRoles(id, ['admin'], Roles.GLOBAL_GROUP)
