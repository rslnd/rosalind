Meteor.methods
  'users/create': (form) ->
    check(form, Schema.UserCreate)

    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      throw new Meteor.Error('not-authorized')

    console.log('Creating user', form.username)

    Events.insert
      type: 'users/create'
      level: 'warning'
      createdBy: Meteor.userId()
      createdAt: new Date()
      payload: form

    Accounts.createUser(form)

  'users/updatePassword': (form) ->
    check(form, Schema.UserUpdatePassword)

    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      throw new Meteor.Error('not-authorized')

    console.log('Setting password for user', form.userId)

    Events.insert
      type: 'users/updatePassword'
      level: 'warning'
      createdBy: Meteor.userId()
      createdAt: new Date()
      payload: _.omit(form, 'password')
      subject: form.userId


    Accounts.setPassword(form.userId, form.password, { logout: false })

  'users/updateRoles': (form) ->
    check(form, Schema.UserUpdateRoles)

    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      throw new Meteor.Error('not-authorized')

    Events.insert
      type: 'users/updateRoles'
      level: 'warning'
      createdBy: Meteor.userId()
      createdAt: new Date()
      payload: form
      subject: form.userId

    roles = form.roles.replace(/\s/ig, '').split(',')
    console.log('Setting roles for user', form.userId, roles)
    Roles.setUserRoles(form.userId, roles, Roles.GLOBAL_GROUP)
