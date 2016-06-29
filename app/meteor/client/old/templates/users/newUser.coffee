{ Create } = require 'api/users/schema/actions'

Template.newUser.helpers
  schema:
    Create

AutoForm.hooks
  insertUserForm:
    onSuccess: (formType, result) -> FlowRouter.go('/users/' + result + '/edit')
