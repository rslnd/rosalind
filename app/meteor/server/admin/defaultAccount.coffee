Meteor.startup ->
  return if Meteor.users.find({}).count() > 0
  return if process.env.IS_MIRROR

  defaultAccount = Meteor?.settings?.private?.admin?.defaultAccount
  if defaultAccount and defaultAccount?.username
    console.log('Creating first admin user', defaultAccount?.username)
    id = Accounts.createUser(defaultAccount)
    Roles.addUsersToRoles(id, ['admin'], Roles.GLOBAL_GROUP)
  else
    console.warn('Please add credentials for the default admin user in settings.json')
