Meteor.methods
  'users/create': (form) ->
    check(form, Schema.UserCreate)

    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      throw new Meteor.Error('not-authorized')

    console.log('Creating user', form.username)
    Accounts.createUser(form)

  'users/updatePassword': (form) ->
    check(form, Schema.UserUpdatePassword)

    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      throw new Meteor.Error('not-authorized')

    console.log('Setting password for user', form.userId)

    Accounts.setPassword(form.userId, form.password, { logout: false })

  'users/updateRoles': (form) ->
    check(form, Schema.UserUpdateRoles)

    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      throw new Meteor.Error('not-authorized')

    roles = form.roles.replace(/\s/ig, '').split(',')
    console.log('Setting roles for user', form.userId, roles)
    Roles.setUserRoles(form.userId, roles, Roles.GLOBAL_GROUP)
