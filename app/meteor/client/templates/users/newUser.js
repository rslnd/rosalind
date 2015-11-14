AutoForm.hooks({
  insertUserForm: {
    onSuccess(formType, result) {
      Router.go('/users/' + result + '/edit');
    }
  }
});
