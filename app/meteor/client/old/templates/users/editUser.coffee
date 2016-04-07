{ Users } = require '/imports/api/users'
{ UpdatePassword, UpdateRoles } = require '/imports/api/users/schema/actions'

Template.editUser.helpers
  user: ->
    Users.findOne(FlowRouter.current().params._id)

  collection: ->
    Users

  updatePassword: ->
    UpdatePassword

  updateRoles: ->
    UpdateRoles

AutoForm.hooks
  editUserForm:
    onSuccess: -> FlowRouter.go('/users/')

  updatePasswordUserForm:
    onSuccess: -> FlowRouter.go('/users/')

  updateRolesUserForm:
    onSuccess: -> FlowRouter.go('/users/')
