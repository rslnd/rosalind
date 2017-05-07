{ Create } = require 'api/users/schema/actions'

Template.newUser.helpers
  schema:
    Create

AutoForm.hooks
  insertUserForm:
    onSuccess: (formType, result) -> window.__deprecated_history_push('/users/' + result + '/edit')
