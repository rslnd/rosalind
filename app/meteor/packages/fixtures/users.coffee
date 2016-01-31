Meteor.methods
  'fixtures/users/create': (options) ->
    check(options, Object)

    if options.attributes
      options = options.attributes

    options.username = options.username.replace(/\s/g, '')
    return false if Meteor.users.findOne(username: options.username)

    options = TestUtil.transformAttributes(options)
    if typeof options.password isnt 'string'
      options.password = '1111'
    unless options.email
      options.email = options.username + '@example.com'
    Accounts.createUser(options)
    return options.username

  'fixtures/users/setRoles': (options) ->
    check(options, Object)

    userId = Meteor.users.findOne(username: options.username)._id
    roles = options.roles.replace(/\s/ig, '').split(',')
    Roles.setUserRoles(userId, roles, Roles.GLOBAL_GROUP)
    return options.username

  'fixtures/assignLastCreatedUserToGroup': (groupName) ->
    check(groupName, String)

    groupId = Groups.findOne(name: groupName)._id
    user = Meteor.users.find({}, sort: { createdAt: -1 }).fetch()[0]
    Meteor.users.update(user._id, $set: { groupId: groupId })
