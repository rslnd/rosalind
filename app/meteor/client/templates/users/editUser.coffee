Template.editUser.helpers
  user: ->
    Meteor.users.findOne(FlowRouter.current().params._id)

AutoForm.hooks
  editUserForm:
    onSuccess: -> FlowRouter.go('/users/')

  updatePasswordUserForm:
    onSuccess: -> FlowRouter.go('/users/')

  updateRolesUserForm:
    onSuccess: -> FlowRouter.go('/users/')
