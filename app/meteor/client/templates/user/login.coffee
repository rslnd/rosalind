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
      revalidate = =>
        vc = AutoForm.getValidationContext(@formId)
        return unless typeof error.reason is 'string'
        if (error.reason.indexOf('User not found') is not -1)
          vc.addInvalidKeys([{ name: 'password', type: 'incorrectPassword' }])
        else if (error.reason.indexOf('Incorrect password') is not -1)
          vc.addInvalidKeys([{ name: 'password', type: 'incorrectPassword' }])
        else if (error.reason.indexOf('User has no password set') is not -1)
          vc.addInvalidKeys([{ name: 'password', type: 'passwordNotSet' }])

      setTimeout(revalidate, 10)
