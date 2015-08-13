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
      if (error.reason.indexOf('Email already exists') !== -1) {
        vc.addInvalidKeys([{name: 'name', type: 'alreadyExists'}]);
      } else if (error.reason.indexOf('User not found') !== -1) {
        vc.addInvalidKeys([{name: 'name', type: 'userNotFound'}]);
      } else if (error.reason.indexOf('Incorrect password') !== -1) {
        vc.addInvalidKeys([{name: 'password', type: 'incorrectPassword'}]);
      } else if (error.reason.indexOf('User has no password set') !== -1) {
        vc.addInvalidKeys([{name: 'password', type: 'passwordNotSet'}]);
      }
    }
    }
  }
});

SimpleSchema.messages({
  alreadyExists: 'A user account already exists for this name. If this is you, you may want to sign in instead. Otherwise, please check your spelling and try again.',
  userNotFound: 'No user account exists for this name. Please check your spelling.',
  incorrectPassword: 'Incorrect password',
  passwordNotSet: 'You have not yet set a password. Please visit the link in the e-mail we sent you.'
});
