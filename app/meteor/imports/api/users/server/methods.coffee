import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/alanning:roles'
import { Events } from '../../events'
import Actions from '../schema/actions'

module.exports = ->
  Meteor.methods
    'users/login': ->
      return unless userId = Meteor.userId()
      console.log('[Users] Logged in', { userId })
      Events.post('users/login', { userId })

    'users/logout': ->
      return unless userId = Meteor.userId()
      console.log('[Users] Logged out', { userId })
      Events.post('users/logout', { userId })

    'users/getToken': ->
      return unless user = Meteor.user()
      console.log('[Users] User requested token', { @userId })
      return user.lastToken()


    'users/create': (form) ->
      check(form, Actions.Create)

      unless Roles.userIsInRole(Meteor.userId(), ['admin'])
        throw new Meteor.Error('not-authorized')

      console.log('[Users] Creating user', form.username)

      Events.post('users/create', { form, userId: Meteor.userId() }, 'warning')

      Accounts.createUser(form)


    'users/updatePassword': (form) ->
      check(form, Actions.UpdatePassword)

      unless Roles.userIsInRole(Meteor.userId(), ['admin'])
        throw new Meteor.Error('not-authorized')

      console.log('[Users] Setting password for user', form.userId)

      Events.post('users/updatePassword', { userId: Meteor.userId() }, 'warning')


      Accounts.setPassword(form.userId, form.password, { logout: false })

    'users/updateRoles': (form) ->
      check(form, Actions.UpdateRoles)

      unless Roles.userIsInRole(Meteor.userId(), ['admin'])
        throw new Meteor.Error('not-authorized')

      Events.post('users/updateRoles', { form, userId: Meteor.userId() }, 'warning')

      roles = form.roles.replace(/\s/ig, '').split(',')
      console.log('[Users] Setting roles for user', form.userId, roles)
      Roles.setUserRoles(form.userId, roles, Roles.GLOBAL_GROUP)
