import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/alanning:roles'
import { Events } from '../../events'
import Actions from '../schema/actions'

export default () => {
  Meteor.methods({
    'users/login': () => {
      const userId = Meteor.userId()
      if (!userId) { return }

      console.log('[Users] Logged in', { userId })
      Events.post('users/login', { userId })
    },

    'users/logout': () => {
      const userId = Meteor.userId()
      if (!userId) { return }

      console.log('[Users] Logged out', { userId })
      Events.post('users/logout', { userId })
    },

    'users/create': (form) => {
      check(form, Actions.Create)

      if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
        throw new Meteor.Error('not-authorized')
      }

      console.log('[Users] Creating user', form.username)
      Events.post('users/create', { form, userId: Meteor.userId() }, 'warning')
      Accounts.createUser(form)
    },

    'users/updatePassword': (form) => {
      check(form, Actions.UpdatePassword)

      if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
        throw new Meteor.Error('not-authorized')
      }

      console.log('[Users] Setting password for user', form.userId)
      Events.post('users/updatePassword', { userId: Meteor.userId() }, 'warning')
      Accounts.setPassword(form.userId, form.password, { logout: false })
    },

    'users/updateRoles': (form) => {
      check(form, Actions.UpdateRoles)

      if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
        throw new Meteor.Error('not-authorized')
      }

      Events.post('users/updateRoles', { form, userId: Meteor.userId() }, 'warning')

      console.log('[Users] Setting roles for user', form.userId, form.roles)
      Roles.setUserRoles(form.userId, form.roles, Roles.GLOBAL_GROUP)
    }
  })
}
