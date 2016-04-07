{ Login } = require '/imports/api/users/schema/actions'

Template.login.helpers
  loggingIn: ->
    Meteor.loggingIn()

  loginSchema: ->
    Login

AutoForm.hooks
  loginForm:
    onSubmit: (form) ->
      if form.name and form.password
        Meteor.loginWithPassword form.name, form.password, (error) =>
          if error
            @done(error)
          else
            Meteor.call('users/login', => @done())
      else
        @done()
      false

    onError: (type, error) ->
      sAlert.error(TAPi18n.__('login.failedMessage'))
