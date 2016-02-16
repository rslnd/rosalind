Schema.UserLogin = new SimpleSchema
  name:
    type: String

  password:
    type: String
    min: 2


Schema.UserCreate = new SimpleSchema
  username:
    type: String


Schema.UserUpdatePassword = new SimpleSchema
  password:
    type: String

  userId:
    type: String


Schema.UserUpdateRoles = new SimpleSchema
  roles:
    type: String

  userId:
    type: String


Meteor.startup ->
  Schema.UserLogin.i18n('login.form')

Accounts.config
  forbidClientAccountCreation: true
