module.exports =
  create: (options) ->
    fn = (options) ->
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

    server.execute(fn, options)

  setRoles: (options) ->
    fn = (options) ->
      userId = Meteor.users.findOne(username: options.username)._id
      roles = options.roles.replace(/\s/ig, '').split(',')
      Roles.setUserRoles(userId, roles, Roles.GLOBAL_GROUP)
      return options.username

    server.execute(fn, options)

  assignLastCreatedUserToGroup: (groupName) ->
    fn = (groupName) ->
      Groups = TestUtil.constantize('Groups')
      groupId = Groups.findOne(name: groupName)._id
      user = Meteor.users.find({}, sort: { createdAt: -1 }).fetch()[0]
      Meteor.users.update(user._id, $set: { groupId: groupId })

    server.execute(fn, groupName)
