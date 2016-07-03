map = require 'lodash/map'
{ browserHistory } = require 'react-router'
{ Users } = require 'api/users'
{ Groups } = require 'api/groups'
{ UpdatePassword, UpdateRoles } = require 'api/users/schema/actions'
schema = require 'api/users/schema/users'

Template.editUser.helpers
  user: ->
    console.error('Not Implemented: Get _id param from url')
    Users.findOne(@params?._id)

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
    onSuccess: -> browserHistory.push('/users/')

  updatePasswordUserForm:
    onSuccess: -> browserHistory.push('/users/')

  updateRolesUserForm:
    onSuccess: -> browserHistory.push('/users/')
