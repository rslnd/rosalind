{ Meteor } = require 'meteor/meteor'
{ check } = require 'meteor/check'
{ Accounts } = require 'meteor/accounts-base'
{ Roles } = require 'meteor/alanning:roles'
{ Events } = require 'api/events'
{ Timesheets } = require 'api/timesheets'
Actions = require 'api/users/schema/actions'

module.exports = ->
  Meteor.methods
    'users/login': ->
      return unless userId = Meteor.userId()
      console.log('[Users] Logged in', { userId })
      Events.insert
        type: 'users/login'
        payload: { userId }

      Timesheets.methods.startTracking({ userId })


    'users/logout': ->
      return unless userId = Meteor.userId()
      console.log('[Users] Logged out', { userId })
      Events.insert
        type: 'users/logout'
        payload: { userId }

      Timesheets.methods.stopTracking({ userId })

    'users/getToken': ->
      return unless user = Meteor.user()
      console.log('[Users] User requested token', { @userId })
      return user.lastToken()


    'users/create': (form) ->
      check(form, Actions.Create)

      unless Roles.userIsInRole(Meteor.userId(), ['admin'])
        throw new Meteor.Error('not-authorized')

      console.log('[Users] Creating user', form.username)

      Events.insert
        type: 'users/create'
        level: 'warning'
        createdBy: Meteor.userId()
        createdAt: new Date()
        payload: form

      Accounts.createUser(form)


    'users/updatePassword': (form) ->
      check(form, Actions.UpdatePassword)

      unless Roles.userIsInRole(Meteor.userId(), ['admin'])
        throw new Meteor.Error('not-authorized')

      console.log('[Users] Setting password for user', form.userId)

      Events.insert
        type: 'users/updatePassword'
        level: 'warning'
        createdBy: Meteor.userId()
        createdAt: new Date()
        payload: _.omit(form, 'password')
        subject: form.userId


      Accounts.setPassword(form.userId, form.password, { logout: false })

    'users/updateRoles': (form) ->
      check(form, Actions.UpdateRoles)

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
      console.log('[Users] Setting roles for user', form.userId, roles)
      Roles.setUserRoles(form.userId, roles, Roles.GLOBAL_GROUP)
