{ browserHistory } = require 'react-router'
{ Create } = require 'api/users/schema/actions'

Template.newUser.helpers
  schema:
    Create

AutoForm.hooks
  insertUserForm:
    onSuccess: (formType, result) -> browserHistory.push('/users/' + result + '/edit')
