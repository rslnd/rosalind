AutoForm.hooks({
  editUserForm: {
    onSuccess() {
      Router.go('/users/');
    }
  },
  updatePasswordUserForm: {
    onSuccess() {
      Router.go('/users/');
    }
  },
  updateRolesUserForm: {
    onSuccess() {
      Router.go('/users/');
    }
  }
});
