Template.editUser.helpers
  user: ->
    Meteor.users.findOne(Router.current().params._id)

AutoForm.hooks
  editUserForm:
    onSuccess: -> Router.go('/users/')

  updatePasswordUserForm:
    onSuccess: -> Router.go('/users/')

  updateRolesUserForm:
    onSuccess: -> Router.go('/users/')
