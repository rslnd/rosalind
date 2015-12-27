AutoForm.hooks
  loginForm:
    onSubmit: (form) ->
      if form.name and form.password
        Meteor.loginWithPassword form.name, form.password, (error) =>
          if error then @done(error) else @done()
      else
        @done()
      false

    onError: (type, error) ->
      sAlert.error(TAPi18n.__('login.failedMessage'))
