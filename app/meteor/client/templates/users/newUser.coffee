AutoForm.hooks
  insertUserForm:
    onSuccess: (formType, result) -> FlowRouter.go('/users/' + result + '/edit')
