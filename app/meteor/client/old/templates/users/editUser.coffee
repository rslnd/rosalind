map = require 'lodash/map'
{ browserHistory } = require 'react-router'
Alert = require('react-s-alert').default
{ Users } = require 'api/users'
{ Groups } = require 'api/groups'
{ UpdatePassword, UpdateRoles } = require 'api/users/schema/actions'
schema = require 'api/users/schema/users'

Template.editUser.helpers
  user: ->
    _id = window.location.pathname.split('/')[2]
    Users.findOne(_id)

  collection: ->
    Users

  schema: ->
    schema

  updatePassword: ->
    UpdatePassword

  updateRoles: ->
    UpdateRoles

  groups: ->
    map(Groups.methods.all(), (g) -> { label: g.name, value: g._id })

AutoForm.hooks
  editUserForm:
    onSuccess: ->
      browserHistory.push('/users/')
      Alert.success(TAPi18n.__('users.editSuccess'))

  updatePasswordUserForm:
    onSuccess: ->
      browserHistory.push('/users/')
      Alert.success(TAPi18n.__('users.editSuccess'))

  updateRolesUserForm:
    onSuccess: ->
      browserHistory.push('/users/')
      console.log(Alert)
      Alert.success(TAPi18n.__('users.editSuccess'))
