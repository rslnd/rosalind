AutoForm.hooks({
  loginForm: {
    onSubmit: function(form) {
      if (form.name && form.password) {
        Meteor.loginWithPassword(form.name, form.password, (error) => {
          error ? this.done(error) : this.done();
        });
      } else {
        this.done();
      }
      return false;
    },
    onError: function (type, error) {
    var vc = AutoForm.getValidationContext(this.formId);
    if (typeof error.reason === 'string') {
      if (error.reason.indexOf('User not found') !== -1) {
        vc.addInvalidKeys([{name: 'password', type: 'incorrectPassword'}]);
      } else if (error.reason.indexOf('Incorrect password') !== -1) {
        vc.addInvalidKeys([{name: 'password', type: 'incorrectPassword'}]);
      } else if (error.reason.indexOf('User has no password set') !== -1) {
        vc.addInvalidKeys([{name: 'password', type: 'passwordNotSet'}]);
      }
    }
    }
  }
});
